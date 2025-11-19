/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',        // 🔑 tells Next to generate a static site in /out

  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  
}

export default nextConfig