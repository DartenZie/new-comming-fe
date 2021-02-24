function imageCompression(file) {
  const base64ToFile = (dataURI, origFile) => {
    let byteString, mimeString

    if (dataURI.split(',')[0].indexOf('base64') !== -1) {
      byteString = atob(dataURI.split(',')[1])
    } else {
      byteString = decodeURI(dataURI.split(',')[1])
    }

    mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

    const content = new Array()
    for (let i = 0; i < byteString.length; i++) {
      content[i] = byteString.charCodeAt(i)
    }

    const newFile = new File([new Uint8Array(content)], origFile.name, {
      type: mimeString,
    })

    // Copy props set by the dropzone in the original file
    const origProps = [
      'upload',
      'status',
      'previewElement',
      'previewTemplate',
      'accepted',
    ]

    origProps.forEach(cur => {
      newFile[cur] = origFile[cur]
    })

    return newFile
  }

  const supportedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

  // Return if file is not an image, or image is in unsupported format
  // Also return if files width or height is 0, just in case
  if (!supportedTypes.includes(file.type) || file.width < 1 || file.height < 1)
    return

  const MAX_WIDTH = 1920
  const MAX_HEIGHT = 1080

  const reader = new FileReader()

  // Convert file to img
  reader.addEventListener('load', (event) => {
    const origImg = new Image()
    origImg.src = event.target.result

    origImg.addEventListener('load', (event) => {
      let width = event.target.width
      let height = event.target.height

      // Don't resize if it's small enough
      if (width <= MAX_WIDTH && height <= MAX_HEIGHT) {
        this.enqueueFile(file)
        return
      }

      // Calculate new dims otherwise
      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width
          width = MAX_WIDTH
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height
          height = MAX_HEIGHT
        }
      }

      // Resize
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      ctx.drawImage(origImg, 0, 0, width, height)

      const resizedFile = base64ToFile(canvas.toDataURL('image/jpeg'), file)

      // Replace original with resized
      const origFileIndex = this.files.indexOf(file)
      this.files[origFileIndex] = resizedFile

      // Enqueue added file manually making it available for
      // further processing by dropzone
      this.enqueueFile(resizedFile)
    })
  })

  reader.readAsDataURL(file)
}

export const createAttachmentDropzone = (requests, token) => {
  const dropzone = new Dropzone('div#dropzoneAttachments', {
    url: `https://hospital.circularo.com/api/v1/files/saveFile?token=${token}`,
    autoQueue: false,
  })

  dropzone.on('addedfile', () => {
    requests.addFile()
  })
  dropzone.on('addedfile', imageCompression)
  dropzone.on('complete', () => {
    requests.decrementCounter()
  })
  dropzone.on('success', (file, resp) => {
    requests.addAttachment(file, resp)
  })

  return dropzone
}
