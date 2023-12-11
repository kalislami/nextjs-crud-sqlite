import { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import path from "path";
import fs from "fs/promises";

const pathDir = path.join(process.cwd(), "/public/uploads/products")

const checkDir = async () => {
    try {
        await fs.readdir(pathDir)
    } catch (error) {
        await fs.mkdir(pathDir)
    }
}

const readFile = (
    req: NextApiRequest,
    saveLocally?: boolean
): Promise<{ files: formidable.Files }> => {
  
    const options: formidable.Options = {};
  
    if (saveLocally) {
        options.uploadDir = pathDir;
        options.filename = (_name, _ext, path) => {
            return Date.now().toString() + "_" + path.originalFilename;
        };
    }
    options.maxFileSize = 2000 * 1024;
    const form = formidable(options);
    
    return new Promise((resolve, reject) => {
        form.parse(req, (err, _fields, files) => {
            if (err) reject(err);
            resolve({ files });
        });
    });
};

export default async function handler (
    req: NextApiRequest, 
    res: NextApiResponse
) {
    try {
        if (req.method !== 'POST') {
            return res.status(405).json({ message: 'not allowed' })
        }
    
        await checkDir()

        const files : any = await readFile(req, true)

        if (Object.keys(files.files).length === 0) {
            return res.status(422).json({ message: 'tidak ada foto yang diupload' })
        }
    
        return res.status(200).json(files);
    } 
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'gagal upload foto' });
    }
};

export const config = {
    api: {
        bodyParser: false,
    }
};