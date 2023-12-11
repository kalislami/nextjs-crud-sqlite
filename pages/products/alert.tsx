export default function Alert({message} :any) {
    return <div className="z-50 font-bold italic text-white fixed bg-green-600 p-5 mw-[200px] top-5 right-5 rounded-lg">
                <h2>{message}</h2>
            </div>   
}