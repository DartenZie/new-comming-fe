export class Requests {
  constructor(axios) {
    // Increment counter so form could not be submitted while file is uploading
    // after upload counter is decremented
    this.counter = 0

    this.attachments = []
    this.axios = axios
  }

  login() {
    return new Promise((resolve) => {
      this.axios
        .post('login', {
          name: 'tester@circularo.com',
          password: 'hospitaltester',
          tenant: 'hospital',
        })
        .then(({ data }) => {
          this.token = data.token
          resolve(this.token)
        })
    })
  }

  addFile() {
    this.counter++
  }
  decrementCounter() {
    this.counter--
  }

  addAttachment({ accepted }, { file }) {
    if (accepted) this.attachments.push({ content: file.hash })
  }

  createNewDocument(data) {
    this.axios
      .post(`/documents?token=${this.token}`, {
        body: {
          documentType: 'annual_medical_report',
          documentTitle: `Annual Medical Report - ${this.#getCurrentDateString()}`,
          ANNUAL_MEDICAL_REPORT_SUBJECTS_NAME: data.name,
          ANNUAL_MEDICAL_REPORT_SUBJECTS_SEX: data.sex,
          ANNUAL_MEDICAL_REPORT_SUBJECTS_DATE_OF_BIRTH: data.birthDate,
          ANNUAL_MEDICAL_REPORT_SUBJECTS_ADDRESS: data.address,
          file: this.attachments,
        },
        definitionType: 'edoc',
        workflow: 'wf_archive',
      })
      .then(({ data: { results } }) => this.onSuccessfulCreation(results))
  }

  createNewDocumentFromFile(file) {
    this.axios
      .post(`/documents?token=${this.token}`, {
        body: {
          documentType: 'annual_medical_report',
          documentTitle: file.originalname,
          pdfFile: {
            content: file.hash,
          },
          file: this.attachments,
        },
        definitionType: 'ext',
        workflow: 'wf_archive',
      })
      .then(({ data: { results } }) => this.onSuccessfulCreation(results))
  }

  onSuccessfulCreation(results) {
    this.documentId = results[0].documentId
    document.getElementById('progress').innerText = 'Done'

    // Redirect
    const redirectParams = {
      documentId: this.documentId,
      documentType: 'annual_medical_report',
      forceHandover: 'Tester',
      callbackUrl: 'http://localhost:8080/thanks',
    }

    const uriComponent = encodeURIComponent(JSON.stringify(redirectParams))

    const redirect = `https://hospital.circularo.com/loginRedirect?redirect=app.signPrepare&redirectParams=${uriComponent}&token=${this.token}`
    window.location.replace(redirect)
  }

  isUploadingDone() {
    return this.counter === 0
  }

  #getCurrentDateString = () => {
    const date = new Date()

    return `${date.getDate() < 9 ? `0${date.getDate()}` : date.getDate()}/${
      date.getMonth() + 1 < 9 ? `0${date.getMonth() + 1}` : date.getMonth() + 1
    }/${date.getFullYear()}`
  }
}
