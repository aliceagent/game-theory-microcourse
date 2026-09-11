import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import { course } from './content/course'
import { strings } from './strings'
import { ThemeToggle } from './components/ThemeToggle'
import { Home } from './routes/Home'
import { Lesson } from './routes/Lesson'
import { UnitComplete } from './routes/UnitComplete'
import { CourseComplete } from './routes/CourseComplete'
import { Catalog } from './routes/Catalog'
import { SeriesHome } from './routes/SeriesHome'
import { NotFound } from './routes/NotFound'

export default function App() {
  return (
    <BrowserRouter>
      <a className="skip-link" href="#content">
        {strings.app.skipToContent}
      </a>
      <div className="page">
        <header className="masthead">
          <Link className="masthead__mark" to="/">
            {course.title}
          </Link>
          <Link className="masthead__catalog" to="/courses">
            {strings.catalog.nav}
          </Link>
          <span className="masthead__meta">{course.subtitle}</span>
          <ThemeToggle />
        </header>
        <main id="content" style={{ paddingBlockStart: 'var(--space-lg)' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/courses" element={<Catalog />} />
            <Route path="/s/:series" element={<SeriesHome />} />
            <Route path="/lesson/:id" element={<Lesson />} />
            <Route path="/unit/:id/complete" element={<UnitComplete />} />
            <Route path="/complete" element={<CourseComplete />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
