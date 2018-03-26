import React from 'react'
import ReactDOM from 'react-dom'
import App from './components/App'

let container = document.createElement('div')
container.id = 'stunter'
document.body.appendChild(container)

const css = [
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700,900',
  'https://fonts.googleapis.com/css?family=Nunito:300,400,500,700,900',
  './css/style.css',
  './css/transitions.css',
]

for (let link of css) {
  let element = document.createElement('link')
  element.href = link
  element.rel = 'stylesheet'
  document.head.appendChild(element)
}

const js = [
  'https://www.google.com/recaptcha/api.js',
]

  js.forEach((link, i) => {
  let element = document.createElement('script')
  element.src = link
  if (i === 0) {
    element.async = true
    element.defer = true
  }
  document.body.appendChild(element)
})

ReactDOM.render(
  <App />,
  document.getElementById('stunter')
)

