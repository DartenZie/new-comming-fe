import home from '../views/home.html'
import form from '../views/form.html'
import existingReport from '../views/existingReport.html'
import thanks from '../views/thanks.html'

export const HomeComponent = {
  render: () => home
}

export const FormComponent = {
  render: () => form
}

export const ExistingReport = {
  render: () => existingReport
}

export const ThanksComponent = {
  render: () => thanks
}

export const ErrorComponent = {
  render: () => {
    return `
      <section>
        <h1>404 | File was not found</h1>
      </section>
    `;
  }
}
