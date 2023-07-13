# XRPL Easy Holder Airdrops
This script has been created to ease the process of airdropping XRP to holders of an NFT from your collection on XRPL. It will snapshot the holders, work out how much each holder is owed from the amount they hold and then distribute to them. It will also create a list of all the holders and the amount they were paid in a new file when it is finished.

## Requirements
- NodeJS	https://nodejs.org/en/download/
- Seed for XRPL wallet to distribute from (with funds to send)

## Installation & Running
1. Download the files from this repository
2. Open a command prompt in the folder you downloaded the files to
3. Run `npm install` to install the required packages
4. Edit the `config.json` file to add your details
5. Run `node airdrop.js` to start the script
6. Wait....
7. Complete!

## Configuration
The `config.json` file contains all the settings for the script. The settings are as follows:
- `seed` - The seed for the wallet to distribute from
- `airdropAmount` - The amount of XRP total to distribute overall, script calculates individual shares
- `issuer` - The issuer of the Collection
- `taxon` - The taxon of the Collection
- `name` - Collection name that appears in transaction Memo
- `network` - is the RPC you will be connecting to. I DO NOT SUGGEST congesting a public network as you will most likely get ratelimited or blocked. You can get a generous one for FREE and even fairly priced tiers through [QuickNode](https://www.quicknode.com?tap_a=67226-09396e&tap_s=3536451-d11bb1&utm_source=affiliate&utm_campaign=generic&utm_content=affiliate_landing_page&utm_medium=generic)
- `blacklist` - An array of addresses to ignore, share amounts are calculated after these addresses are removed from the total

## Extra Notes
This bot gets the holder snapshot using the [xrpl.services](https://api.xrpldata.com/docs/static/index.html) API. Thanks for this great resource!

## Finishing up
If you have any questions, my DMs are always open on

- Twitter > @iamshiffed
- Discord > Shiffed#2071
- New Discord Handles > shiffed
- Email > shiffed@puppy.tools

Tips are always welcome and help continue development

XRPL: `rm2AEVUcxeYh6ZJUTkWUqVRPurWdn4E9W`
