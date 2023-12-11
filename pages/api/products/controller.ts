import { NextApiRequest, NextApiResponse } from "next";
import connectDB from "../connect";
import fs from "fs/promises";
import path from "path";
import { existsSync } from "fs";

type Data = {
    data?: Product[],
    message?: string,
    total?: number,
    total_page?: number,
    page?: number,
    per_page?: number,
    id_produk?: number,
    need_reload?: boolean
}

type Product = {
    id?: number,
    nama: string,
    deskripsi: string,
    harga: number,
    stok: number,
    foto: string,
    suplier_id: number
}

class ProductController {

    private async getLastId() {
        const db = await connectDB()
        const lastId = await db.get(`SELECT MAX(id) as id FROM produk LIMIT 1`);
        return lastId.id ? lastId.id + 1 : 1
    }

    private async getById(
        id: number,
        select?: string
    ) {
        const db = await connectDB()
        let sql = `SELECT * FROM produk WHERE id = ${id} LIMIT 1`;

        if (select) {
            sql = `SELECT ${select} FROM produk WHERE id = ${id} LIMIT 1`;
        }

        const data = await db.get(sql);
        return data
    }

    async get(
        req: NextApiRequest,
        res: NextApiResponse<Data>,
    ) {
        const { id, page, per_page }: any = req.query
        if (id) {
            const data = await this.getById(id, 'nama, deskripsi, harga, stok, foto, suplier_id')
            res.status(200).json({ data })
        }

        const perPage = per_page ? per_page : 10
        const offset = page ? (page - 1) * perPage : 0
        const currentPage = (offset / perPage) + 1

        const db = await connectDB()
        const totalData = await db.get(`SELECT COUNT(*) as total FROM produk`);
        const data = await db.all(`SELECT * FROM produk p JOIN suplier s ON p.suplier_id = s.id_suplier 
                                ORDER BY p.id DESC LIMIT ${perPage} OFFSET ${offset}`);

        res.status(200).json({
            total: totalData.total,
            total_page: Math.ceil(totalData.total / perPage),
            page: currentPage,
            per_page: perPage,
            data
        })
    }

    private pathDir(filename: string) {
        return path.join(process.cwd(), `/public/uploads/products/${filename}`)
    }

    async post(
        req: NextApiRequest,
        res: NextApiResponse<Data>
    ) {
        try {
            const db = await connectDB()
            const body = JSON.parse(req.body)
            const lastId = await this.getLastId()

            let optMessage = ''

            if (body.foto === '') {
                optMessage = ', upload gagal silahkan reupload dengan cara edit produk'
                body.foto = lastId
            }
            else {
                const splitFoto = body.foto.split('.')
                const extension = '.' + splitFoto[splitFoto.length - 1]
                const newFilename = lastId + extension
                await fs.rename(this.pathDir(body.foto), this.pathDir(newFilename))
                body.foto = newFilename
            }

            const values = Object.values(body)

            let validate = true
            values.map(v => { if (v === '') validate = false })
            if (!validate) {
                if (body.foto !== '') {
                    if (existsSync(this.pathDir(body.foto))) {
                        await fs.unlink(this.pathDir(body.foto))
                    }
                }
                return res.status(422).json({ message: `pastikan data produk lengkap` })
            }

            values.unshift(lastId)

            const insertSql: string = `INSERT INTO produk VALUES (?,?,?,?,?,?,?)`;
            await db.run(insertSql, values);

            return res.status(200).json({
                message: `produk berhasil ditambah ${optMessage}`
            })
        }
        catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'gagal tambah produk' })
        }
    }

    async patch(
        req: NextApiRequest,
        res: NextApiResponse<Data>
    ) {
        try {
            const { id }: any = req.query
            if (!id) res.status(400).json({ message: 'invalid id' })

            const findData = await this.getById(id);
            if (!findData) res.status(404).json({ message: 'id not found' })

            const body = JSON.parse(req.body)

            let optMessage = ''
            let needReload = false
            if (findData.foto !== body.foto) {
                const splitOldFoto = findData.foto.split('.')
                const oldExtension = '.' + splitOldFoto[splitOldFoto.length - 1]
                if (existsSync(this.pathDir(findData.foto))) {
                    await fs.unlink(this.pathDir(findData.foto))
                }

                if (body.foto === '') {
                    optMessage = ', upload gagal silahkan reupload lagi'
                    body.foto = id
                }
                else {
                    const splitFoto = body.foto.split('.')
                    const extension = '.' + splitFoto[splitFoto.length - 1]

                    //jika ekstensi foto lama dan foto baru sama => harus reload page
                    if (extension === oldExtension) needReload = true

                    const newFilename = id + extension
                    await fs.rename(this.pathDir(body.foto), this.pathDir(newFilename))
                    body.foto = newFilename
                }
            }

            const values = Object.values(body)

            let validate = true
            values.map(v => { if (v === '') validate = false })
            if (!validate) {
                return res.status(422).json({ message: `pastikan data produk lengkap` })
            }

            const db = await connectDB();
            const sql: string = `UPDATE produk 
                SET nama = ?, deskripsi = ?, harga = ?, stok = ?, foto = ?, suplier_id = ?
                WHERE id = ${id}`;
            await db.run(sql, values);

            return res.status(200).json({
                message: `berhasil update produk ${optMessage}`,
                need_reload: needReload
            })
        }
        catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'gagal update' })
        }
    }

    async remove(
        req: NextApiRequest,
        res: NextApiResponse<Data>
    ) {
        try {
            const { id }: any = req.query
            if (!id) res.status(400).json({ message: 'invalid id' })

            const findData = await this.getById(id);
            if (!findData) res.status(404).json({ message: 'id not found' })

            if (existsSync(this.pathDir(findData.foto))) {
                await fs.unlink(this.pathDir(findData.foto))
            }

            const db = await connectDB()
            const sql: string = `DELETE FROM produk WHERE id=${id}`;
            await db.run(sql);

            return res.status(200).json({ message: 'produk berhasil dihapus' })
        }
        catch (error) {
            console.log(error);
            return res.status(400).json({ message: 'gagal update' })
        }
    }

    block(
        req: NextApiRequest,
        res: NextApiResponse<Data>
    ) {
        return res.status(405).json({ message: 'not allowed' })
    }
}

export default new ProductController();