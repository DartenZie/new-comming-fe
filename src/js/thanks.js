class Thanks {
  constructor() {
    this.isError()
    this.seconds = 5

    if (!this.error) {
      document.getElementById('success').classList.add('active')
    } else {
      document.getElementById('failed').classList.add('active')
    }

    this.changeState()
  }

  isError() {
    const params = new URLSearchParams(window.location.search)
    if (params.has('error')) this.error = true
  }

  changeState() {
    setTimeout(() => {
      const timeoutElements = document.querySelectorAll('.timeout')
      const arr = Array.prototype.slice.call(timeoutElements)

      arr.forEach(cur => {
        cur.innerText = this.seconds
      })

      if (this.seconds !== 0) {
        this.seconds--
        this.changeState()
      } else {
        this.redirect()
      }
    }, 1000)
  }

  redirect() {
    window.location.replace('/')
  }
}

export default function () {
  return new Thanks()
}
