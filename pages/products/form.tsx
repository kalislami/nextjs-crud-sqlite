import { useRouter } from "next/router"
import { useEffect, useState } from "react"

export default function FormProduct({ onCancel, refetchProduct, editId, onAlert }: any) {
    const [previewFoto, setPreviewFoto] = useState('')
    const [updateFoto, setUpdateFoto] = useState(false)
    const [dataFoto, setDataFoto] = useState('')
    const [suplier, setSuplier] = useState([])
    const [formData, setFormData] = useState({
        nama: '',
        deskripsi: '',
        harga: '',
        stok: '',
        foto: '',
        suplier_id: '',
    })
    const router = useRouter()

    const handleChangeForm = ({ target }: any) => {
        setFormData({
            ...formData,
            [target.id]: target.value,
        });
    }

    const submitProduk = async (filename : string) => {
        const method = editId === '' ? 'POST' : 'PATCH'
        const query = editId === '' ? '' : `?id=${editId}`
        
        //  tambah atau edit (ganti foto)
        if (editId === '' || dataFoto !== '') {
            formData.foto = filename
        }

        return await fetch(`/api/products${query}`, {
            method,
            body: JSON.stringify(formData)
        })
    }

    const uploadFoto =  async () => {
        const body = new FormData()
        body.set('file', dataFoto)

        return await fetch('/api/products/upload', { method: 'POST', body })
    }

    const handleSubmit = async (e: any) => {
        e.preventDefault()

        let filename = ''
        //  tambah atau edit (ganti foto)
        if (editId === '' || dataFoto !== '') {
            const upload = await uploadFoto()
            const uploadData = await upload.json()

            if (upload.status === 200) {
                const { newFilename } = uploadData.files.file
                filename = newFilename
            }
            else { //jika gagal upload
                onAlert(uploadData.message)
            }   
        }
        
        const submit = await submitProduk(filename)
        const data = await submit.json()

        onAlert(data.message)

        if (data.need_reload) {
            router.reload()
        }
        
        if (submit.status === 200) {
            refetchProduct()
            onCancel()
        }
    }

    const handleChangeFile = async ({ target }: any) => {
        const file = target.files[0]
        if (!file) return

        if (!(
            file.type === 'image/png'
            || file.type === 'image/jpeg'
            || file.type === 'image/jpg'
        )) {
            onAlert('invalid file')
            return
        }

        if (file.size > 2000000) {
            onAlert('file size terlalu besar (max 2mb)')
            return
        }

        setPreviewFoto(URL.createObjectURL(file))
        setDataFoto(file)
    }

    const getSuplier = async () => {
        const res = await fetch('/api/suplier')
        const json = await res.json()
        if (json.data) setSuplier(json.data)
    }

    const getProduct = async (id: number) => {
        const res = await fetch(`/api/products?id=${id}`)
        const product = await res.json()
        const { data } = product

        setPreviewFoto(`/uploads/products/${data.foto}`)
        setFormData({
            nama: data.nama,
            deskripsi: data.deskripsi,
            harga: data.harga,
            stok: data.stok,
            foto: data.foto,
            suplier_id: data.suplier_id,
        });
    }

    useEffect(() => {
        getSuplier()
        if (editId !== '') {
            getProduct(editId)
        }
    }, [])

    return (
        <>
            <div className="backdrop"></div>
            <div className="w-1/2 p-10 bg-gray-100 rounded-xl border absolute top-20 left-[25%]">
                <h2 className="text-2xl font-bold text-center">Tambah Produk</h2>
                <form onSubmit={handleSubmit} className="py-10">
                    <div>
                        <label htmlFor="nama">Nama</label>
                        <input type="text" name="nama" id="nama" value={formData.nama} onChange={handleChangeForm} />
                    </div>
                    <div>
                        <label htmlFor="deskripsi">Deskripsi</label>
                        <textarea name="deskripsi" id="deskripsi" onChange={handleChangeForm} value={formData.deskripsi}></textarea>
                        {/* <input type="text" name="deskripsi" id="deskripsi" value={formData.deskripsi} onChange={handleChangeForm} /> */}
                    </div>
                    <div>
                        <label htmlFor="harga">Harga (Rp.)</label>
                        <input type="number" name="harga" id="harga" value={formData.harga} onChange={handleChangeForm} />
                    </div>
                    <div>
                        <label htmlFor="stok">Stok</label>
                        <input type="number" name="stok" id="stok" value={formData.stok} onChange={handleChangeForm} />
                    </div>
                    {previewFoto !== '' && (
                        <div>
                            <h4>preview foto:</h4>
                            <img style={{ maxWidth: '200px' }} src={previewFoto} alt="foto" />
                        </div>
                    )}
                    {(updateFoto || editId === '') && (
                        <div>
                            <label htmlFor="foto">Foto</label>
                            <input accept=".png, .jpg, .jpeg" type="file" name="foto" id="foto" onChange={handleChangeFile} />
                        </div>
                    )}

                    {editId !== '' && !updateFoto && (
                        <div>
                            <div></div>
                            <button className="btn btn-light" onClick={e => {
                                e.preventDefault()
                                setUpdateFoto(true)
                            }}>
                                update foto
                            </button>
                        </div>
                    )}
                    <div>
                        <label htmlFor="suplier_id">Suplier</label>
                        <select value={formData.suplier_id} name="suplier_id" id="suplier_id" onChange={handleChangeForm}>
                            <option value="">Pilih</option>
                            {suplier && suplier.map((s: any) => 
                                (<option key={s.id_suplier} value={s.id_suplier}>{s.nama_suplier}</option>)
                            )}
                        </select>
                    </div>
                    
                    <div>
                        <button className="btn btn-light col-span-2" onClick={onCancel} >Batal</button>
                        <button className="btn btn-submit col-span-2 ml-2" type="submit">{editId === '' ? 'Tambah' : 'Ubah'}</button>
                    </div>
                </form>
            </div>
        </>
    )
}