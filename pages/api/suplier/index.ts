import connectDB from "../connect";
import { NextApiRequest, NextApiResponse } from "next";

const generate = async (res: NextApiResponse) => {
  const db = await connectDB()
  const values = [
    [1, 'Toko Laptop', 'Jakarta', 'laptop@test.com'],
    [2, 'Toko Sepatu', 'Jakarta', 'sepatu@test.com'],
    [3, 'Toko handphone', 'Jakarta', 'hp@test.com'],
    [4, 'Toko Tas', 'Jakarta', 'tas@test.com'],
    [5, 'Toko Serba Ada', 'Jakarta', 'toserba@test.com']
  ]

  const insertSql: string = `INSERT INTO suplier VALUES (?,?,?,?)`;
  
  for (let i = 0; i < values.length; i++) {
    await db.run(insertSql, values[i]);
  }

  res.status(200).send('sukses generate suplier')
}

const clear = async (res: NextApiResponse) => {
  const db = await connectDB()
  await db.run(`DELETE FROM suplier`);

  res.status(200).send('table suplier berhasil dikosongkan')
}

const get = async (res: NextApiResponse) => {
  const db = await connectDB()
  const data = await db.all(`SELECT * FROM suplier`);

  res.status(200).json({data})
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {method} = req

  switch (method) {
    case 'GET':
      get(res)
      break;
    case 'POST':
      generate(res)
      break;
    case 'DELETE':
      clear(res)
      break;
    default:
      res.status(405).send('method salah')
      break;
  }
}

export const config = {
    api: {
      externalResolver: true
    }
  }