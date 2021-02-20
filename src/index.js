import 'core-js/stable'

import './styles/index.scss'

import 'jquery/dist/jquery'
import 'select2/dist/js/select2'
import 'dropzone/dist/dropzone'

import {
  HomeComponent,
  FormComponent,
  ExistingReport,
  ThanksComponent,
} from './js/components'
import { Router } from './js/router'
import form from './js/form'
import existingReport from './js/existingReport'

const routes = [
  { path: '/', component: HomeComponent },
  { path: '/form', component: FormComponent, script: form },
  {
    path: '/existing-report',
    component: ExistingReport,
    script: existingReport,
  },
  { path: '/thanks', component: ThanksComponent },
]

const router = new Router({ routes })
