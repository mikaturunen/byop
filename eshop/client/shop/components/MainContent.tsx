import * as React from 'react'
import Payment from './payments/Payments'

export interface MainContentProperties {
}

export interface MainContentState {
}

/**
 * MainContent component that essentially is the "main" (or content) area of the actual eshop.
 */
class MainContent extends React.Component<MainContentProperties, MainContentState> {
  constructor() {
    super()
  }


  render() {
    return (
      <div>
        <section className="main">
          <button>Show payments</button>
          <Payment />
        </section>
      </div>
    )
  }
}

export default MainContent
