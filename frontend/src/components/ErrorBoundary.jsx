import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("SI Ignite UI Error Boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center max-w-xl mx-auto my-8 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4 text-xl font-bold">
            !
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">View Render Recovery</h2>
          <p className="text-sm text-slate-500 mb-6">
            A temporary component render exception was caught. Your session and backend intelligence remain fully active.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.reload();
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              Refresh View
            </button>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.href = '/dashboard';
              }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
