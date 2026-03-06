import SubdomainSection from '../components/SubdomainSection'

export default function Subdomains() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Subdomains</h1>
        <p className="text-sm text-gray-500 mt-1">Manage custom subdomains for your shortened links</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <SubdomainSection />
      </div>
    </div>
  )
}
