import 'core-js/stable'

import './styles/index.scss'

import 'jquery/dist/jquery'
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
import thanks from './js/thanks'

const routes = [
  { path: '/', component: HomeComponent },
  { path: '/form', component: FormComponent, script: form },
  {
    path: '/existing-report',
    component: ExistingReport,
    script: existingReport,
  },
  { path: '/thanks', component: ThanksComponent, script: thanks },
]

const router = new Router({ routes })
