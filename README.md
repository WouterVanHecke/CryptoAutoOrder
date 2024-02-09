# CryptoAutoOrder

Set a list of coins to buy or sell across multiple exchanges with one command line

# How to use

Copy the .env.example to .env file and input your keys and secrets

In the index file in the 'src' folder:
Change 'shouldOrder' to true (note that the script will actually buy or sell when this is changed).
Set the 'orderType' based on if you want to buy or sell.
Change the buy or sell config to your liking, you can add any coin with any amount,
as long as that coin is present on that exchange and you have the funds to run the script.

You might want to use this to sell 10% of all your holdings once a week each time you run the script when the market gets overextended.
Or when adding more funds to your account and you don't want to buy everything manually.
