/* global $ */

import { action } from 'mobx'
import { observer } from 'mobx-react'
import React, { Component, PropTypes } from 'react'
import { findDOMNode } from 'react-dom'
import Reporter from '@cypress/core-reporter'

import windowUtil from '../lib/window-util'
import State from '../lib/state'

import Header from '../header/header'
import Iframes from '../iframe/iframes'
import Message from '../message/message'
import RunnerWrap from './runner-wrap'

@observer
class App extends Component {
  render () {
    return (
      <div>
        <Reporter
          ref='reporter'
          runner={this.props.runner.reporterBus}
          specPath={this._specPath()}
        />
        <RunnerWrap
          className='container'
          style={{ left: this.props.state.reporterWidth }}
        >
          <Header ref='header' {...this.props} />
          <Iframes {...this.props} />
          <Message state={this.props.state} />
          {this.props.children}
        </RunnerWrap>
      </div>
    )
  }

  componentDidMount () {
    this._monitorWindowResize()
  }

  _specPath () {
    return `${this.props.config.integrationFolder}/${this.props.windowUtil.specFile()}`
  }

  _monitorWindowResize () {
    const state = this.props.state

    const $window = $(this.props.window)
    const $header = $(findDOMNode(this.refs.header))
    const $reporter = $(findDOMNode(this.refs.reporter))

    this._onWindowResize = action('window:resize', () => {
      state.updateWindowDimensions({
        windowWidth: $window.width(),
        windowHeight: $window.height(),
        reporterWidth: $reporter.outerWidth(),
        headerHeight: $header.outerHeight(),
      })
    })

    $window.on('resize', this._onWindowResize).trigger('resize')
  }

  componentWillUnmount () {
    $(this.props.window).off('resize', this._onWindowResize)
  }
}

App.defaultProps = {
  window,
  windowUtil,
}

App.propTypes = {
  config: PropTypes.shape({
    browsers: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string.isRequired,
      majorVersion: PropTypes.string.isRequired,
      version: PropTypes.string.isRequired,
    })).isRequired,
    env: PropTypes.string.isRequired,
    integrationFolder: PropTypes.string.isRequired,
    numTestsKeptInMemory: PropTypes.number.isRequired,
    projectName: PropTypes.string.isRequired,
    viewportHeight: PropTypes.number.isRequired,
    viewportWidth: PropTypes.number.isRequired,
  }).isRequired,
  runner: PropTypes.shape({
    notifyRunningSpec: PropTypes.func.isRequired,
    reporterBus: PropTypes.shape({
      emit: PropTypes.func.isRequired,
      on: PropTypes.func.isRequired,
    }).isRequired,
  }).isRequired,
  state: PropTypes.instanceOf(State).isRequired,
}

export default App
