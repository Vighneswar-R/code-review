import React, { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  // componentDidCatch(error, info) {
  //   console.error('Error caught by ErrorBoundary:', error);
  //   console.error('Error info:', info);
  //   this.setState({ errorInfo: info });

  // }

  // componentDidUpdate(prevProps) {
  //   // If children change, reset error and update last good state
  //   if (prevProps.children !== this.props.children) {
  //     this.setState({ hasError: false, lastGoodChildren: this.props.children });
  //   }
  // }

  componentDidCatch(error, info) {
    console.error('Error caught by ErrorBoundary:', error);
    console.error('Error info:', info);
    this.setState({
      error,
      errorInfo: info,
      hasError: true,
      lastGoodChildren: this.props.children,
    });
  }
  
  componentDidUpdate(prevProps) {
    if (!this.state.hasError && prevProps.children !== this.props.children) {
      this.setState({ lastGoodChildren: this.props.children });
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return this.state.lastGoodChildren; // Show last working UI
    }
    return this.props.children;
  }
}

export default ErrorBoundary;