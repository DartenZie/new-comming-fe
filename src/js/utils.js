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

    origProps.forEach((cur) => {
      newFile[cur] = origFile[cur]
    })

    return newFile
  }

  const MAX_WIDTH = 1920
  const MAX_HEIGHT = 1080

  const reader = new FileReader()

  // Convert file to img
  reader.addEventListener('load', (event) => {
    const supportedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

    // Return if file is not an image, or image is in unsupported format
    if (!supportedTypes.includes(file.type)) {
      // Create HTML element for file icon
      const fileIcon = document.createElement('div')
      fileIcon.classList.add('file-icon')
      fileIcon.innerText = file.type.split('/')[1]

      // Remove img element and replace it with icon element
      const dzImage = file.previewElement.querySelector('.dz-image')
      dzImage.removeChild(dzImage.childNodes[0])
      dzImage.appendChild(fileIcon)

      return this.enqueueFile(file)
    }

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

export const createAttachmentDropzone = (requests, token) =>
  new Dropzone('div#dropzoneAttachments', {
    url: `https://hospital.circularo.com/api/v1/files/saveFile?token=${token}`,
    autoQueue: false,
    init: function() {
      this.on('addedfile', imageCompression)
      this.on('success', (file, resp) => {
        requests.addAttachment(file, resp)
      })
    },
  })
