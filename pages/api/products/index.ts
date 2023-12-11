import type { NextApiRequest, NextApiResponse } from 'next'
import controller from './controller'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
    ) {

  const {method} = req

  switch (method) {
    case 'GET':
      controller.get(req, res)
      break;
    case 'POST':
      controller.post(req, res)
      break;
    case 'PATCH':
      controller.patch(req, res)
      break;
    case 'DELETE':
      controller.remove(req, res)
      break;
    default:
      controller.block(req, res)
      break;
  }
}

export const config = {
  api: {
    externalResolver: true
  }
}