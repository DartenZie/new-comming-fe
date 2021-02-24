import axios from 'axios'
import { load } from 'recaptcha-v3'
import { Requests } from './requests'
import { createAttachmentDropzone } from "./utils";

class Form {
  name = ''
  sex = 'male'
  birthDate = ''
  address = ''
  dropzoneAttachments
  axios
  token
  documentId

  constructor() {
    this.axios = axios.create({
      baseURL: 'https://hospital.circularo.com/api/v1',
      headers: { 'Content-Type': 'application/json' },
    })

    this.requests = new Requests(this.axios)

    this.loadCaptcha()
    this.getQueryParams()
    this.fillParamsInForm()
    this.requests.login().then((token) => this.afterLogin(token))

    document.getElementById('form').addEventListener('submit', (e) => {
      e.preventDefault()
      this.onSubmit()
    })
  }

  afterLogin(token) {
    this.token = token

    // Create dropzone
    this.dropzoneAttachments = createAttachmentDropzone(
      this.requests,
      this.token
    )
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

  onSubmit() {
    if (!this.requests.isUploadingDone()) return

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

    document.querySelector('.loading').classList.remove('d-none')
    document.querySelector('.form').classList.add('d-none')
    document.getElementById('progress').innerText = 'Creating your document...'

    this.requests.createNewDocument(data)
  }
}

export default function () {
  return new Form()
}
