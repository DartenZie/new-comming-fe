import axios from 'axios'
import { load } from 'recaptcha-v3'
import { Requests } from './requests'

class ExistingReport {
  token
  dropzone
  dropzoneAttachments
  document

  constructor() {
    this.axios = axios.create({
      baseURL: 'https://hospital.circularo.com/api/v1',
      headers: { 'Content-Type': 'application/json' },
    })

    this.requests = new Requests(this.axios)

    this.loadCaptcha()
    this.requests.login().then((token) => this.afterLogin(token))

    document.getElementById('form').addEventListener('submit', (e) => {
      e.preventDefault()
      this.onSubmit()
    })
  }

  afterLogin(token) {
    this.token = token

    // Create drop zones
    this.dropzone = new Dropzone('div#dropzone', {
      url: `https://hospital.circularo.com/api/v1/files/saveFile?token=${this.token}`,
    })
    this.dropzoneAttachments = new Dropzone('div#dropzoneAttachments', {
      url: `https://hospital.circularo.com/api/v1/files/saveFile?token=${this.token}`,
    })

    // Add events to drop zones
    this.dropzone.on('success', (file, resp) => {
      this.document = resp.file
    })
    this.dropzoneAttachments.on('addedfile', (file) =>
      this.requests.addFile(file)

      // TODO compression if image
    )
    this.dropzoneAttachments.on('complete', () => {
      this.requests.decrementCounter()
    })
    this.dropzoneAttachments.on('success', (file, resp) => {
      this.requests.addAttachment(file, resp)
    })
  }

  loadCaptcha() {
    load('6LexTF0aAAAAAGpOqnCy2BXuTGWySrAYlZqpwOPP')
      .then((recaptcha) => {
        recaptcha
          .execute('submit')
          .then((token) => {
            this.axios.defaults.headers.common['g-recaptcha-response'] = token
          })
          .catch(console.error)
      })
      .catch(console.error)
  }

  onSubmit() {
    if (!this.requests.isUploadingDone() || !this.document) return

    document.querySelector('.loading').classList.remove('d-none')
    document.querySelector('.form').classList.add('d-none')
    document.getElementById('progress').innerText = 'Creating your document...'

    this.requests.createNewDocumentFromFile(this.document)
  }
}

export default function () {
  return new ExistingReport()
}
