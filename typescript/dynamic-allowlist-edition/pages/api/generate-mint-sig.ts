import { NextApiRequest, NextApiResponse } from 'next'
import { ThirdwebSDK } from '@thirdweb-dev/sdk'
import { ethers } from 'ethers'
import { table } from '../../utils/Airtable'

const generateMintSignature = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const { address } = JSON.parse(req.body)

  const record = await table
    .select({
      fields: ['Addresses', 'minted'],
      filterByFormula: `NOT({Addresses} != '${address}')`
    })
    .all()

  if (record.length === 0) {
    res.status(404).json({
      error: "User isn't in allowlist"
    })
  } else {
    const sdk = new ThirdwebSDK(
      new ethers.Wallet(
        process.env.PRIVATE_KEY as string,
        ethers.getDefaultProvider(process.env.ALCHEMY_API_URL)
      )
    )

    const edition = sdk.getEdition('0xf12538a74211fC85D92E7236CF1525A52EFB653B')
    try {
      const signedPayload = await edition.signature.generateFromTokenId({
        tokenId: 0,
        quantity: '1',
        to: address
      })

      res.status(200).json({
        signedPayload: signedPayload
      })
    } catch (err) {
      res.status(500).json({
        error: err
      })
    }
  }
}

export default generateMintSignature
