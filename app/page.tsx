import Link from "next/link";

export default function Home() {
  return (
    <>
      <section className="max-w-[90vw] mx-auto px-4" id="container">
        <header className="flex justify-between items-center py-6">
          <div className="flex items-center space-x-2">
            <svg
              className="h-8 w-8 text-black"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M13 10V3L4 14h7v7l9-11h-7z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              ></path>
            </svg>
            <span className="text-xl font-bold">CLOUDNOTES</span>
          </div>
          <nav className="hidden md:flex items-center bg-gray-800 bg-opacity-50 rounded-full p-1 shadow-2xl">
            <a
              className="px-4 py-2 text-sm text-white hover:bg-gray-700 rounded-full"
              href="#"
            >
              Our process
            </a>
            <a
              className="px-4 py-2 text-sm text-white hover:bg-gray-700 rounded-full"
              href="#"
            >
              Database
            </a>
            <a
              className="px-4 py-2 text-sm text-white hover:bg-gray-700 rounded-full"
              href="#"
            >
              Financing
            </a>
            <a
              className="flex items-center px-4 py-2 text-sm text-white hover:bg-gray-700 rounded-full"
              href="#"
            >
              <span>For buyers</span>
              <span className="material-icons text-sm ml-1">expand_more</span>
            </a>
            <a
              className="px-4 py-2 text-sm text-white hover:bg-gray-700 rounded-full"
              href="#"
            >
              About us
            </a>
            <a
              className="px-4 py-2 text-sm bg-white text-black rounded-full ml-4"
              href="#"
            >
              Contact Us
            </a>
          </nav>
          <button className="md:hidden p-2 rounded-md text-white hover:bg-gray-700">
            <span className="material-icons">menu</span>
          </button>
        </header>
        <main className="grid md:grid-cols-2 gap-8 mt-10 sm:mt-20">
          <div className="flex flex-col justify-center">
            <h1
              className="text-5xl sm:text-6xl md:text-7xl font-bold leading-tight tracking-tighter relative right-2"
              style={{
                lineHeight: "95%",
              }}
            >
              Your notes
              <br />
              stored on
              <br />
              the{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-500">
                cloud.
              </span>
            </h1>
            <div className="mt-2">
              <h2 className="text-xl font-semibold">
                Fast. Intelligent. Individual.
              </h2>
              <p className="mt-2 text-gray-400 max-w-md">
                CLOUDNOTES helps you create notes that are saved to the cloud.
                Grab an AI summary every now and then.
              </p>
            </div>
            <div className="mt-12 flex items-center space-x-4">
              <a
                className="bg-white text-black px-6 py-3 rounded-full font-semibold text-sm hover:bg-gray-200 border-2 border-gray-200"
                href="#"
              >
                About Us
              </a>
              <Link
                className="bg-gray-800 text-white px-6 py-3 rounded-full font-semibold text-sm hover:bg-gray-700"
                href="/signin"
              >
                Get Started
              </Link>
            </div>
          </div>
          <div className="relative animate-pulse">
            <div className="absolute w-full h-full">
              <div className="absolute -top-1/4 -right-1/4 w-96 h-96 bg-blue-500 rounded-full opacity-50 blur-3xl -z-10"></div>
              <div className="absolute top-0 right-0 w-80 h-80 bg-blue-400 rounded-full opacity-40 blur-3xl -z-10"></div>
              <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-blue-300 rounded-full opacity-30 blur-3xl -z-10"></div>
            </div>
          </div>
        </main>
      </section>
    </>
  );
}
