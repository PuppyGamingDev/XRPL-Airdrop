const { settings, blacklist } = require('./config.json');
const xrpl = require('xrpl');
const axios = require('axios');
const fs = require('node:fs');

const runAirdrop = async () => {
	var data = null;
	// Get the NFTs from the XRPL Services API
	try {
		const response = await axios.get(`https://api.xrpldata.com/api/v1/xls20-nfts/issuer/${settings.issuer}/taxon/${settings.taxon}`)
		data = response.data.data;
	} catch (error) {
		console.log(`There was an error getting that collection information from the XRPL Services API`);
		return;
	}
	if (!data || !data.nfts.length) {
		console.log(`There are no NFTs in that collection`);
		return;
	}
	// Iterate through the NFTs and get the holders and the amount they hold
	const nfts = data.nfts;
	console.log(`There are ${nfts.length} NFTs in the collection`);
	var holders = {};
	var holderCount = 0;
	var splitShare = 0;
	for (const n of nfts) {
		if (blacklist.includes(n.Owner)) {
			continue;
		}
		if (!holders[n.Owner]) {
			holders[n.Owner] = 1;
			holderCount++;
			splitShare++;
			continue;
		}
		holders[n.Owner]++;
		splitShare++;
	}
	var share = settings.airdropTotal / splitShare;
	share = share.toFixed(6);
	console.log(`There are ${holderCount} holders of NFTs in the collection (After Blacklist removals)`);
	console.log(`There are ${splitShare} NFTs to be divided by, meaning each NFT will receive ${share} XRP`);

	// Get wallet from provided Seed and connect to XRPL
	const wallet = xrpl.Wallet.fromSeed(settings.seed);
	const client = new xrpl.Client(settings.network);
	await client.connect();

	// Check the balance of the wallet to make sure it has enough to cover the airdrop
	const account = await client.request({
		command: "account_info",
		account: wallet.address
	});
	const balance = parseFloat(xrpl.dropsToXrp(account.result.account_data.Balance));
	if (balance + (0.000012 * splitShare) <= settings.airdropTotal) {
		console.log(`Sorry but you do not have enough to cover the airdrop. You have ${balance} XRP and need ${settings.airdropTotal} XRP with enough to cover transactions too`);
		return;
	}

	var payouts = {};
	// Iterate through the holders and send them their share
	var completed = 0
	var failed = 0;
	for (const [key, value] of Object.entries(holders)) {
		var drops = value * share;
		drops = drops.toFixed(6)
		const dropsFormatted = xrpl.xrpToDrops(parseInt(drops));
		payouts[key] = { held: value, share: drops, status: "pending" };
		try {
			const prepared = await client.autofill({
				"TransactionType": "Payment",
				"Account": wallet.address,
				"Destination": key,
				"Amount": dropsFormatted,
				"Memos": [
					{
						"Memo": {
							"MemoData": Buffer.from(`Airdrop from ${settings.name} using PuppyTools Airdrop Script`).toString('hex')
						}
					}
				]
			})
			const signed = wallet.sign(prepared)
			const tx = await client.submitAndWait(signed.tx_blob)
			payouts[key].status = "success";
			payouts[key].tx = signed.hash;
			completed++;
		} catch (error) {
			payouts[key].status = "failed";
			payouts[key].error = error;
			failed++;
			completed++;
		}
		console.log(`Processed ${completed} / ${Object.entries(holders).length} transactions`);
	}
	// Disconnect from XRPL
	await client.disconnect();
	console.log(`Payouts completed with ${failed} failed payouts, writing output file to payouts.json`);
	// Write payout info to file
	fs.writeFile(`./payouts.json`, JSON.stringify(payouts, null, 4), finished);
	function finished(err) {
		console.log(`Finished writing file... All complete!`);
	}
	return;

};

runAirdrop();