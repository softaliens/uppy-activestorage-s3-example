// This file is automatically compiled by Webpack, along with any other files
// present in this directory. You're encouraged to place your actual application logic in
// a relevant structure within app/javascript and only use these pack files to reference
// that code so it'll be compiled.

require("@rails/ujs").start()
require("turbolinks").start()
require("@rails/activestorage").start()
require("channels")

const Uppy = require('@uppy/core')
const Dashboard = require('@uppy/dashboard')
const Dropbox = require('@uppy/dropbox')
const OneDrive = require('@uppy/onedrive')
const GoogleDrive = require('@uppy/google-drive')
const Url = require('@uppy/url')
const AwsS3 = require('@uppy/aws-s3')

require('@uppy/core/dist/style.css')
require('@uppy/dashboard/dist/style.css')

document.addEventListener('turbolinks:load', () => {
  document.querySelectorAll('[data-uppy]').forEach(element => setupUppy(element))
})

function setupUppy(element) {
  let trigger = element.querySelector('[data-behavior="uppy-trigger"]')
  let form = element.closest('form')
  let field_name = element.dataset.uppy

  trigger.addEventListener("click", (event) => event.preventDefault())

  let uppy = Uppy({
    autoProceed: true,
    allowMultipleUploads: false,
    logger: Uppy.debugLogger
  })

  uppy.use(Dashboard, {
    trigger: trigger,
    closeAfterFinish: true,
  })

  uppy.use(Dropbox, {
    target: Dashboard,
    companionUrl: 'https://proofreadingservices-companion.herokuapp.com/'
  })

  uppy.use(OneDrive, {
    target: Dashboard,
    companionUrl: 'https://proofreadingservices-companion.herokuapp.com/'
  })

  uppy.use(GoogleDrive, {
    target: Dashboard,
    companionUrl: 'https://proofreadingservices-companion.herokuapp.com/'
  })

  uppy.use(Url, {
    target: Dashboard,
    companionUrl: 'https://proofreadingservices-companion.herokuapp.com/'
  })

  uppy.use(AwsS3, {
    limit: 1,
    timeout: 60000,
    companionUrl: 'https://proofreadingservices-companion.herokuapp.com/'
  })

  uppy.on('complete', (result) => {
    // Rails.ajax
    // or show a preview:
    element.querySelectorAll('[data-pending-upload]').forEach(element => element.parentNode.removeChild(element))

    result.successful.forEach(file => {
      appendUploadedFile(element, file, field_name)
      setPreview(element, file)
    })

    uppy.reset()
  })
}

function appendUploadedFile(element, file, field_name) {
  let fileObj = {
    key_name: file.response.body.key,
    filename: file.name,
    content_type: file.type,
    byte_size: file.size,
    etag: file.response.body.etag
  }

  let hiddenField = document.createElement('input')
  hiddenField.setAttribute('type', 'hidden')
  hiddenField.setAttribute('name', field_name)
  hiddenField.setAttribute('data-pending-upload', true)
  hiddenField.setAttribute('value', JSON.stringify(fileObj))
  element.appendChild(hiddenField)
}

function setPreview(element, file) {
  let preview = element.querySelector('[data-behavior="uppy-preview"]')
  if (preview) {
    let src = (file.preview) ? file.preview : "https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcSpj0DBTVsaja01_xWh37bcutvpd7rh7zEd528HD0d_l6A73osY"
    preview.src = src
  }
}
