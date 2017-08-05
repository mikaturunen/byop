import { Dispatch } from 'redux'
import { connect } from 'react-redux'
import * as React from 'react'

import {
  Header,
  MainContent,
  model
} from '../../shop'

interface AppProps {
  dispatch: Dispatch<{}>
}

class App extends React.Component<AppProps, void> {
  render() {
    return (
      <div className="eshop">
        <Header />
        <MainContent />
      </div>
    )
  }
}

const mapStateToProps = state => ({

})

export default connect(mapStateToProps)(App)
