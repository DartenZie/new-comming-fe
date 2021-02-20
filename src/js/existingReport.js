import axios from 'axios'
import { load } from 'recaptcha-v3'
import {
  attachFileRequest,
  login,
  newDocumentFromExistingFileRequest,
} from './requests'

class ExistingReport {
  token
  dropzone
  dropzoneAttachments
  document
  files = []

  constructor() {
    this.axios = axios.create({
      baseURL: 'https://hospital.circularo.com/api/v1',
      headers: { 'Content-Type': 'application/json' },
    })

    this.loadCaptcha()
    this.login()

    document.getElementById('form').addEventListener('submit', (e) => {
      e.preventDefault()
      this.onSubmit()
    })
  }

  login() {
    login(this.axios)
      .then(({ data }) => {
        this.token = data.token

        this.dropzone = new Dropzone('div#dropzone', {
          url: `https://hospital.circularo.com/api/v1/files/saveFile?token=${this.token}`,
        })
        this.dropzoneAttachments = new Dropzone('div#dropzoneAttachments', {
          url: `https://hospital.circularo.com/api/v1/files/saveFile?token=${this.token}`,
        })

        this.dropzone.on('success', (file, resp) => {
          this.document = resp.file
        })
        this.dropzoneAttachments.on('success', (file, resp) => {
          this.files.push(resp.file)
        })
      })
      .catch((err) => console.error(err))
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

  async onSubmit() {
    document.querySelector('.loading').classList.remove('d-none')
    document.querySelector('.form').classList.add('d-none')
    document.getElementById('progress').innerText = 'Creating your document...'

    const {
      data: { results },
    } = await newDocumentFromExistingFileRequest(
      this.axios,
      this.token,
      this.document
    )
    this.documentId = results[0].documentId

    document.getElementById('progress').innerText =
      'Attaching files to your document...'

    for (let i = 0; i < this.files.length; i++) {
      await attachFileRequest(
        this.axios,
        this.token,
        this.files[i],
        this.documentId
      )
    }

    document.getElementById('progress').innerText = 'Done'

    // Redirect
    const uriComponent = encodeURIComponent(
      `{documentId:"${this.documentId}",documentType:"annual_medical_report",forceHandover:"Tester",callbackUrl:"http://localhost:8080/thanks"}`
    )
    const redirect = `https://hospital.circularo.com/loginRedirect?redirect=app.signPrepare&redirectParams=${uriComponent}&token=${this.token}`
    window.location.replace(redirect)
  }
}

export default function () {
  return new ExistingReport()
}
