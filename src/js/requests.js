const getCurrentDateString = () => {
  const date = new Date()

  return `${date.getDate() < 9 ? `0${date.getDate()}` : date.getDate()}/${
    date.getMonth() + 1 < 9 ? `0${date.getMonth() + 1}` : date.getMonth() + 1
  }/${date.getFullYear()}`
}

export const login = (axios) => {
  return axios.post('login', {
    name: 'tester@circularo.com',
    password: 'hospitaltester',
    tenant: 'hospital'
  })
}

export const newDocumentRequest = (axios, token, data) => {
  return axios.post(`/documents?token=${token}`, {
    body: {
      documentType: 'annual_medical_report',
      documentTitle: `Annual Medical Report - ${getCurrentDateString()}`,
      ANNUAL_MEDICAL_REPORT_SUBJECTS_NAME: data.name,
      ANNUAL_MEDICAL_REPORT_SUBJECTS_SEX: data.sex,
      ANNUAL_MEDICAL_REPORT_SUBJECTS_DATE_OF_BIRTH: data.birthDate,
      ANNUAL_MEDICAL_REPORT_SUBJECTS_ADDRESS: data.address,
    },
    definitionType: 'edoc',
    workflow: 'wf_archive',
  })
}

export const newDocumentFromExistingFileRequest = (axios, token, file) => {
  return axios.post(`/documents?token=${token}`, {
    body: {
      documentType: 'annual_medical_report',
      documentTitle: file.originalname,
      pdfFile: {
        content: file.hash
      }
    },
    definitionType: 'ext',
    workflow: 'wf_archive',
  })
}

export const attachFileRequest = (axios, token, file, documentId) => {
  return axios.post(`/attachments/${documentId}?token=${token}`, {
    fileHash: file.hash,
    document_type: 'upload',
    document_name: file.originalname,
    file_type: 'upload'
  })
}
