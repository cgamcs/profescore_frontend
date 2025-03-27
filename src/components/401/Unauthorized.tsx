import { Link } from "react-router-dom"

const Unauthorized = () => {
  return (
    <>
        <main className="max-h-screen">
            <div className="flex flex-col justify-center items-center m-40">
                <h1 className="font-black text-center text-4xl">Registro no autorizado</h1>

                <p className="text-center mt-10">
                    Tal vez quieras volver a {' '}
                    <Link className="text-indigo-500" to={'/'}>Facultades</Link>
                </p>
            </div>
        </main>
        
    </>
  )
}

export default Unauthorized