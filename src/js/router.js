import { ErrorComponent } from './components'

export class Router {
  routes = []

  constructor(options) {
    this.routes = options.routes

    window.addEventListener('load', this.router)

    // Make component change while user click on browsers back or forward button
    window.onpopstate = () => this.router()
  }

  findComponentByPath = (path) =>
    this.routes.find((r) => r.path === path) || undefined

  router = () => {
    const path = window.location.pathname
    // Find the component based on the current path
    const route = this.findComponentByPath(path)
    let component

    if (route) component = route.component
    // If there's no matching route, get the "Error" component
    else component = ErrorComponent

    // Render the component in the "app" placeholder
    document.getElementById('app').innerHTML = component.render()

    // Change all links into spa-links
    document.querySelectorAll('.spa-link').forEach((cur) => {
      const path = cur.getAttribute('href')

      cur.addEventListener('click', (e) => {
        e.preventDefault()
        this.navigate(path)
      })
    })

    // If component has its own js load it by its init function
    if (route.script) route.script()
  }

  navigate = (path) => {
    window.history.pushState(null, null, path)
    this.router()
  }
}
