import axios from 'axios'
import { load } from 'recaptcha-v3'
import { Requests } from './requests'
import { createAttachmentDropzone, imageCompression } from './utils'

class ExistingReport {
  token
  dropzone
  dropzoneAttachments
  document

  constructor() {
    this.axios = axios.create({
      baseURL: 'https://test.circularo.com/api/v1',
      headers: { 'Content-Type': 'application/json' },
    })

    this.requests = new Requests(this.axios)

    this.loadCaptcha()
    this.requests.login().then((token) => this.afterLogin(token))

    document.getElementById('form').addEventListener('submit', (e) => {
      e.preventDefault()
      this.nextStep()
    })

    document.getElementById('attachments').addEventListener('submit', (e) => {
      e.preventDefault()
      this.onSubmit()
    })
  }

  afterLogin(token) {
    this.token = token

    // Create dropzone
    this.dropzone = new Dropzone('div#dropzone', {
      url: `https://test.circularo.com/api/v1/files/saveFile?token=${this.token}`,
      acceptedFiles: 'application/pdf',
    })
    this.dropzoneAttachments = createAttachmentDropzone(
      this.requests,
      this.token
    )

    // Add events to dropzone
    this.dropzone.on('addedfile', function (file) {
      if (this.files.length > 1) {
        this.removeFile(this.files[0])
      }

      // Create HTML element for file icon
      const fileIcon = document.createElement('div')
      fileIcon.classList.add('file-icon')
      fileIcon.innerText = file.type.split('/')[1]

      // Remove img element and replace it with icon element
      const dzImage = file.previewElement.querySelector('.dz-image')
      dzImage.removeChild(dzImage.childNodes[0])
      dzImage.appendChild(fileIcon)
    })
    this.dropzone.on('success', (file, resp) => {
      this.document = resp.file
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

  nextStep() {
    if (!this.requests.isUploadingDone() || !this.document) return

    document.getElementById('form').classList.remove('active')
    document.getElementById('attachments').classList.add('active')
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
