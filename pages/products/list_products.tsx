import { useEffect, useState } from "react";
import FormProduct from "./form";
import Alert from "./alert";

export default function ListProducts() {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [page, setPage] = useState(1)
    const [totalPage, setTotalPage] = useState(1)
    const [editId, setEditId] = useState('')
    const [alert, setAlert] = useState({
        display: false,
        message: ''
    })

    const getProducts = async (page = 1) => {
        const get = await fetch(`/api/products?page=${page}&per_page=3`)
        const obj = await get.json()

        if (obj.data) {
            // console.log(obj);
            setTotalPage(obj.total_page)
            setPage(obj.page)
            setProducts(obj.data)
            setLoading(false)
        }
    }

    const handleForm = (editId?: any) => {
        const id = editId ? editId : ''
        setEditId(id)
        setShowForm(true)
    }

    const handleDelete = async (id: number) => {
        const action = await fetch(`/api/products?id=${id}`, { method: 'DELETE' })
        const res = await action.json()
        showAlert(res.message)
        await getProducts()
    }

    const handlePaging = async (next?: boolean) => {
        const newPage = next ? page + 1 : page - 1

        if (newPage < 1 || newPage > totalPage) return

        await getProducts(newPage)
    }

    const showAlert = (msg : string) => {
        setAlert({
            display: true,
            message: msg
        })

        setTimeout(() => {
            setAlert({
                display: false,
                message: ''
            })  
        }, 2000);
    }

    useEffect(() => { getProducts() }, [])

    return (
        <>
            {alert.display && <Alert message={alert.message} />}
            {showForm && <FormProduct editId={editId} refetchProduct={() => getProducts()} onCancel={() => setShowForm(false)} onAlert={(msg: string) => showAlert(msg)} />}

            <div className="container px-20 py-10 text-center">
                <h2 className="text-4xl font-bold">Data Produk</h2>
                <button className="btn btn-light mt-5" onClick={() => handleForm()}> Tambah </button>

                {loading && <h2 className="text-4xl font-bold">Memuat produk...</h2>}

                <div className="grid grid-cols-3 gap-4 pt-10">
                    {products && products.length > 0 && products.map((product: any, i: number) => 
                    <div className="card" key={i}>
                        <div className="w-full h-[200px] bg-gray-100 rounded-xl">
                            <img className="w-auto h-full mx-auto" src={`/uploads/products/${product.foto}`} alt={product.foto}/>
                        </div>
                        <div className="p-5">
                            <h3 className="text-xl font-bold">{product.nama}</h3>
                            <p className="italic my-2">{product.deskripsi}</p>
                            <div className="grid grid-cols-3 border-t mt-2 pt-2">
                                <p>Harga</p> <p className="col-span-2">: Rp.{product.harga}</p>
                                <p>stok</p> <p className="col-span-2">: {product.stok}</p>
                                <p>Suplier</p> <p className="col-span-2">: {product.nama_suplier}</p>
                            </div>
                        </div>
                        <div className="p-5 text-center border-t">
                            <button onClick={() => handleForm(product.id)} className="btn btn-card-edit mr-2">Edit</button>
                            <button onClick={() => handleDelete(product.id)} className="btn btn-card-hapus">Hapus</button>
                        </div>
                    </div>
                    )}
                </div>

                {totalPage > 1 && (
                    <div className="py-10">
                        <button className="btn btn-light" onClick={() => handlePaging()}> Sebelumnya </button>
                        <span> Halaman {page} </span>
                        <button className="btn btn-light" onClick={() => handlePaging(true)}> Selanjutnya </button>
                    </div>
                )}
                
                {!loading && products && products.length === 0 &&
                <h2 className="text-4xl font-bold">Produk kosong, silahkan tambahkan produk terlebih dahulu</h2>}

            </div>
        </>
    );
}
