import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import './progress.css'

NProgress.configure({
  showSpinner: false
})

export function progressStart() {
  NProgress.start()
}

export function progressDone() {
  NProgress.done()
}

export function setProgress(progress) {
  NProgress.set(progress)
}
