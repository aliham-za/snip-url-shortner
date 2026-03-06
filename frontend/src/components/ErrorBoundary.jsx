import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8">
            <h1 className="text-4xl font-bold text-gray-300 mb-4">Something went wrong</h1>
            <p className="text-gray-500 mb-6">An unexpected error occurred.</p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null })
                window.history.pushState({}, '', '/dashboard')
                window.dispatchEvent(new PopStateEvent('popstate'))
              }}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
