import axios from 'axios'
import { load } from 'recaptcha-v3'
import { login, newDocumentRequest, attachFileRequest } from './requests'

class Form {
  name = ''
  sex = 'male'
  birthDate = ''
  address = ''
  dropzoneAttachments
  axios
  token
  documentId
  files = []

  constructor() {
    this.axios = axios.create({
      baseURL: 'https://hospital.circularo.com/api/v1',
      headers: { 'Content-Type': 'application/json' },
    })

    this.loadCaptcha()
    this.getQueryParams()
    this.fillParamsInForm()
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

        this.dropzoneAttachments = new Dropzone('div#dropzoneAttachments', {
          url: `https://hospital.circularo.com/api/v1/files/saveFile?token=${this.token}`,
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

  getQueryParams() {
    const params = new URLSearchParams(window.location.search)

    if (params.has('name')) this.name = params.get('name')
    if (params.has('sex')) this.sex = params.get('sex')
    if (params.has('birthDate')) this.birthDate = params.get('birthDate')
    if (params.has('address')) this.address = params.get('address')
  }

  fillParamsInForm() {
    document.getElementById('name').value = this.name
    document.getElementById('sex').value = this.sex
    document.getElementById('birthDate').value = this.birthDate
    document.getElementById('address').value = this.address
  }

  async onSubmit() {
    document.querySelector('.loading').classList.remove('d-none')
    document.querySelector('.form').classList.add('d-none')

    this.name = document.getElementById('name').value
    this.sex = document.getElementById('sex').value
    this.birthDate = document.getElementById('birthDate').value
    this.address = document.getElementById('address').value

    const data = {
      name: this.name,
      sex: this.sex,
      birthDate: this.birthDate,
      address: this.address,
    }

    document.getElementById('progress').innerText = 'Creating your document...'

    const {
      data: { results },
    } = await newDocumentRequest(this.axios, this.token, data)
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
    const uriComponent = encodeURIComponent(`{documentId:"${this.documentId}",documentType:"annual_medical_report",forceHandover:"Tester",callbackUrl:"http://localhost:8080/thanks"}`)
    const redirect = `https://hospital.circularo.com/loginRedirect?redirect=app.signPrepare&redirectParams=${uriComponent}&token=${this.token}`
    window.location.replace(redirect)
  }
}

export default function () {
  return new Form()
}
