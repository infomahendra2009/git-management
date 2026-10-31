import { useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../api.js';

const planets = [
  { name: 'Mercury', color: '#b7a89c', size: 7, type: 'Rocky planet', fact: 'The smallest planet, and the closest to the Sun. One trip around the Sun takes just 88 Earth days.', velocity: '47.4 km/s', period: '88 Earth days', distance: '0.39 AU' },
  { name: 'Venus', color: '#e8b66d', size: 9, type: 'Rocky planet', fact: 'Our hottest planet. Its thick atmosphere traps heat, making the surface hot enough to melt lead.', velocity: '35.0 km/s', period: '225 Earth days', distance: '0.72 AU' },
  { name: 'Earth', color: '#4c91e8', size: 10, type: 'Rocky planet', fact: 'Our home is the only world we know of with liquid water on its surface and life.', velocity: '29.8 km/s', period: '365 Earth days', distance: '1.00 AU' },
  { name: 'Mars', color: '#dc7354', size: 8, type: 'Rocky planet', fact: 'The Red Planet has the tallest volcano in the solar system: Olympus Mons.', velocity: '24.1 km/s', period: '687 Earth days', distance: '1.52 AU' },
  { name: 'Jupiter', color: '#d9a77e', size: 27, type: 'Gas giant', fact: 'The largest planet. Its Great Red Spot is a giant storm that has raged for centuries.', velocity: '13.1 km/s', period: '11.9 Earth years', distance: '5.20 AU' },
  { name: 'Saturn', color: '#ead28a', size: 23, type: 'Gas giant', fact: 'Saturn’s bright rings are made mostly of countless pieces of ice and rock.', velocity: '9.7 km/s', period: '29.4 Earth years', distance: '9.58 AU' },
  { name: 'Uranus', color: '#78c8cf', size: 17, type: 'Ice giant', fact: 'Uranus rotates on its side, giving it some of the most extreme seasons in the solar system.', velocity: '6.8 km/s', period: '84 Earth years', distance: '19.2 AU' },
  { name: 'Neptune', color: '#5578e8', size: 16, type: 'Ice giant', fact: 'The most distant planet. Supersonic winds sweep through its deep blue atmosphere.', velocity: '5.4 km/s', period: '164.8 Earth years', distance: '30.1 AU' },
];

const lessons = [
  { title: 'The solar system', eyebrow: 'YOUR SPACE ADVENTURE', copy: 'Travel from the Sun through eight fascinating planets. Choose a world in the model to reveal a quick fact, then explore each lesson page.' },
  { title: 'Inner worlds', eyebrow: 'LESSON 02 · ROCKY PLANETS', copy: 'The four planets nearest the Sun are small, dense worlds with solid surfaces. They are called the terrestrial, or rocky, planets.' },
  { title: 'Giant worlds', eyebrow: 'LESSON 03 · OUTER PLANETS', copy: 'Beyond the asteroid belt are four giant planets. Jupiter and Saturn are gas giants; Uranus and Neptune are ice giants.' },
  { title: 'Mission check', eyebrow: 'LESSON 04 · CHECK YOUR KNOWLEDGE', copy: 'One quick question before you complete this learning journey.' },
  { title: 'India explorer', eyebrow: 'GEOGRAPHY · STATES & NEIGHBORS', copy: 'Explore India’s state and union territory boundaries, find capitals, and discover neighboring countries.' },
];

const lessonPlanets = [[0, 1, 2, 3], [4, 5, 6, 7]];
const missionQuestion = 'Which planet is closest to the Sun?';
const answers = ['Mercury', 'Saturn', 'Earth'];
const indianRegions = [
  { name: 'Jammu & Kashmir', capital: 'Srinagar (summer), Jammu (winter)', kind: 'Union territory', short: 'J&K', col: 4, row: 1 },
  { name: 'Ladakh', capital: 'Leh', kind: 'Union territory', short: 'Ladakh', col: 5, row: 1 },
  { name: 'Himachal Pradesh', capital: 'Shimla', kind: 'State', short: 'Himachal', col: 4, row: 2 },
  { name: 'Punjab', capital: 'Chandigarh', kind: 'State', short: 'Punjab', col: 3, row: 3 },
  { name: 'Chandigarh', capital: 'Chandigarh', kind: 'Union territory', short: 'Chandigarh', col: 4, row: 3 },
  { name: 'Uttarakhand', capital: 'Dehradun (winter), Gairsain (summer)', kind: 'State', short: 'Uttarakhand', col: 5, row: 3 },
  { name: 'Haryana', capital: 'Chandigarh', kind: 'State', short: 'Haryana', col: 4, row: 4 },
  { name: 'Delhi', capital: 'New Delhi', kind: 'Union territory', short: 'Delhi', col: 5, row: 4 },
  { name: 'Rajasthan', capital: 'Jaipur', kind: 'State', short: 'Rajasthan', col: 2, row: 4 },
  { name: 'Uttar Pradesh', capital: 'Lucknow', kind: 'State', short: 'Uttar Pradesh', col: 5, row: 5 },
  { name: 'Sikkim', capital: 'Gangtok', kind: 'State', short: 'Sikkim', col: 7, row: 4 },
  { name: 'Arunachal Pradesh', capital: 'Itanagar', kind: 'State', short: 'Arunachal', col: 8, row: 3 },
  { name: 'Assam', capital: 'Dispur', kind: 'State', short: 'Assam', col: 8, row: 4 },
  { name: 'Nagaland', capital: 'Kohima', kind: 'State', short: 'Nagaland', col: 9, row: 5 },
  { name: 'Meghalaya', capital: 'Shillong', kind: 'State', short: 'Meghalaya', col: 7, row: 5 },
  { name: 'Manipur', capital: 'Imphal', kind: 'State', short: 'Manipur', col: 9, row: 6 },
  { name: 'Tripura', capital: 'Agartala', kind: 'State', short: 'Tripura', col: 8, row: 6 },
  { name: 'Mizoram', capital: 'Aizawl', kind: 'State', short: 'Mizoram', col: 9, row: 7 },
  { name: 'Bihar', capital: 'Patna', kind: 'State', short: 'Bihar', col: 6, row: 5 },
  { name: 'West Bengal', capital: 'Kolkata', kind: 'State', short: 'W. Bengal', col: 7, row: 6 },
  { name: 'Jharkhand', capital: 'Ranchi', kind: 'State', short: 'Jharkhand', col: 6, row: 6 },
  { name: 'Madhya Pradesh', capital: 'Bhopal', kind: 'State', short: 'M. Pradesh', col: 4, row: 6 },
  { name: 'Chhattisgarh', capital: 'Raipur', kind: 'State', short: 'Chhattisgarh', col: 5, row: 7 },
  { name: 'Gujarat', capital: 'Gandhinagar', kind: 'State', short: 'Gujarat', col: 2, row: 6 },
  { name: 'Dadra & Nagar Haveli and Daman & Diu', capital: 'Daman', kind: 'Union territory', short: 'Dadra-Daman', col: 2, row: 7 },
  { name: 'Maharashtra', capital: 'Mumbai', kind: 'State', short: 'Maharashtra', col: 4, row: 7 },
  { name: 'Goa', capital: 'Panaji', kind: 'State', short: 'Goa', col: 3, row: 8 },
  { name: 'Telangana', capital: 'Hyderabad', kind: 'State', short: 'Telangana', col: 5, row: 8 },
  { name: 'Odisha', capital: 'Bhubaneswar', kind: 'State', short: 'Odisha', col: 7, row: 7 },
  { name: 'Andhra Pradesh', capital: 'Amaravati', kind: 'State', short: 'Andhra', col: 6, row: 8 },
  { name: 'Karnataka', capital: 'Bengaluru', kind: 'State', short: 'Karnataka', col: 4, row: 9 },
  { name: 'Puducherry', capital: 'Puducherry', kind: 'Union territory', short: 'Puducherry', col: 6, row: 9 },
  { name: 'Kerala', capital: 'Thiruvananthapuram', kind: 'State', short: 'Kerala', col: 4, row: 10 },
  { name: 'Tamil Nadu', capital: 'Chennai', kind: 'State', short: 'Tamil Nadu', col: 5, row: 10 },
  { name: 'Lakshadweep', capital: 'Kavaratti', kind: 'Union territory', short: 'Lakshadweep', col: 1, row: 9 },
  { name: 'Andaman & Nicobar Islands', capital: 'Sri Vijaya Puram (formerly Port Blair)', kind: 'Union territory', short: 'Andaman', col: 9, row: 10 },
];
const neighboringCountries = [
  { name: 'Pakistan', relation: 'Land neighbor · northwest' },
  { name: 'Afghanistan', relation: 'Land neighbor claimed by India · northwest' },
  { name: 'China', relation: 'Land neighbor · north and northeast' },
  { name: 'Nepal', relation: 'Land neighbor · north' },
  { name: 'Bhutan', relation: 'Land neighbor · northeast' },
  { name: 'Bangladesh', relation: 'Land neighbor · east' },
  { name: 'Myanmar', relation: 'Land neighbor · east' },
  { name: 'Sri Lanka', relation: 'Maritime neighbor · south' },
  { name: 'Maldives', relation: 'Maritime neighbor · southwest' },
];

const INDIA_BOUNDARIES_URL = 'https://media.githubusercontent.com/media/wmgeolab/geoBoundaries/9469f09/releaseData/gbOpen/IND/ADM1/geoBoundaries-IND-ADM1_simplified.geojson';
const INDIA_BOUNDARY_ATTRIBUTION = 'State boundaries: geoBoundaries (CC BY 2.5 IN), based on DataMeet India community / Election Commission of India data.';

function normalizeRegionName(name) {
  return name.toLowerCase().replace(/&/g, 'and').replace(/[^a-z]/g, '');
}

function getFeatureRings(geometry) {
  if (geometry.type === 'Polygon') return geometry.coordinates;
  if (geometry.type === 'MultiPolygon') return geometry.coordinates.flat();
  return [];
}

function createCapitalRound() {
  const shuffle = (items) => {
    const result = [...items];
    for (let index = result.length - 1; index > 0; index -= 1) {
      const otherIndex = Math.floor(Math.random() * (index + 1));
      [result[index], result[otherIndex]] = [result[otherIndex], result[index]];
    }
    return result;
  };
  const regions = shuffle(indianRegions);
  return { regions, capitals: shuffle(regions) };
}

export function SolarSystemAssignments() {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [classIds, setClassIds] = useState(new Set());
  const [studentIds, setStudentIds] = useState(new Set());
  const [section, setSection] = useState('classes');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    Promise.all([api('/classes'), api('/users?role=STUDENT'), api('/learning-module/assignments')])
      .then(([classData, userData, assignments]) => {
        setClasses(classData.classes);
        setStudents(userData.users.filter((student) => student.isActive));
        setClassIds(new Set(assignments.classIds));
        setStudentIds(new Set(assignments.studentIds));
        setReady(true);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const visibleStudents = useMemo(() => {
    const term = search.trim().toLowerCase();
    return students.filter((student) => !term || [student.name, student.email, student.userCode].some((value) => value.toLowerCase().includes(term)));
  }, [search, students]);

  const toggle = (setter, id) => setter((current) => {
    const next = new Set(current);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  });

  const save = async () => {
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const result = await api('/learning-module/assignments', {
        method: 'PUT',
        body: { classIds: [...classIds], studentIds: [...studentIds] },
      });
      setNotice(`Module assigned to ${result.classes} class(es) and ${result.students} student account(s).`);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="card portal-loading">Loading module assignments…</div>;

  return (
    <section className="solar-admin">
      <div className="card solar-admin-hero">
        <span className="eyebrow">ADMIN · LEARNING MODULE</span>
        <h1>Solar System Explorer</h1>
        <p>Assign this interactive learning module to student accounts or entire classes. Class assignments automatically include current and future class members.</p>
        <div className="solar-admin-counts"><span><strong>{classIds.size}</strong> classes</span><span><strong>{studentIds.size}</strong> individual students</span></div>
      </div>
      <div className="card solar-assignment-card">
        <div className="subtabs solar-assignment-tabs" role="group" aria-label="Assignment targets">
          <button type="button" aria-pressed={section === 'classes'} className={section === 'classes' ? 'active' : ''} onClick={() => setSection('classes')}>Assign to classes <span>{classIds.size}</span></button>
          <button type="button" aria-pressed={section === 'students'} className={section === 'students' ? 'active' : ''} onClick={() => setSection('students')}>Assign to students <span>{studentIds.size}</span></button>
        </div>
        {section === 'classes'
          ? <div className="solar-target-list">
            {classes.map((item) => (
              <label className="solar-target" key={item.id}>
                <input type="checkbox" checked={classIds.has(item.id)} onChange={() => toggle(setClassIds, item.id)} />
                <span className="solar-target-icon">▦</span>
                <span><strong>{item.name}</strong><small>{item.members} students · {item.owner}</small></span>
              </label>
            ))}
            {classes.length === 0 && <p className="muted">No classes yet. Create a class from the Classes tab first.</p>}
          </div>
          : <>
            <label className="solar-search-label" htmlFor="solar-student-search">Find a student</label>
            <input id="solar-student-search" className="solar-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, email or student ID" />
            <div className="solar-target-list solar-student-list">
              {visibleStudents.map((student) => (
                <label className="solar-target" key={student.id}>
                  <input type="checkbox" checked={studentIds.has(student.id)} onChange={() => toggle(setStudentIds, student.id)} />
                  <span className="solar-target-avatar">{student.name.slice(0, 1).toUpperCase()}</span>
                  <span><strong>{student.name}</strong><small>{student.userCode} · {student.email}</small></span>
                </label>
              ))}
              {visibleStudents.length === 0 && <p className="muted">No active students match your search.</p>}
            </div>
          </>}
        {error && <div className="err" role="alert">{error}</div>}
        {notice && <div className="ok" role="status">{notice}</div>}
        <div className="solar-assignment-actions">
          <span className="muted">Save replaces the current module assignment list.</span>
          <button type="button" onClick={save} disabled={!ready || saving}>{saving ? 'Saving…' : 'Save assignments'}</button>
        </div>
      </div>
    </section>
  );
}

export default function SolarSystemModule({ initialPage = 0 }) {
  const [page, setPage] = useState(initialPage);
  const [selected, setSelected] = useState(2);
  const [displayMode, setDisplayMode] = useState('speed');
  const [is3d, setIs3d] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [speed, setSpeed] = useState(1);
  const [answer, setAnswer] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(indianRegions[0]);
  const [regionSearch, setRegionSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('All');
  const [indiaMode, setIndiaMode] = useState('map');
  const [hoveredRegion, setHoveredRegion] = useState(null);
  const [indiaBoundaries, setIndiaBoundaries] = useState([]);
  const [indiaMapLoading, setIndiaMapLoading] = useState(false);
  const [indiaMapError, setIndiaMapError] = useState('');
  const [capitalRound, setCapitalRound] = useState(createCapitalRound);
  const [selectedMatchRegion, setSelectedMatchRegion] = useState(null);
  const [matchedRegions, setMatchedRegions] = useState(new Set());
  const [matchMessage, setMatchMessage] = useState('');
  const [lastMatchAttempt, setLastMatchAttempt] = useState(null);
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  const [mapError, setMapError] = useState('');
  const mapCardRef = useRef(null);
  const planet = planets[selected];
  const visibleRegions = indianRegions.filter((region) =>
    (regionFilter === 'All' || region.kind === regionFilter)
      && `${region.name} ${region.capital} ${region.kind}`.toLowerCase().includes(regionSearch.trim().toLowerCase()),
  );
  const displayRegion = hoveredRegion || selectedRegion;
  const matchedCapitals = new Set(capitalRound.regions.filter((region) => matchedRegions.has(region.name)).map((region) => region.name));
  const mapShapes = useMemo(() => {
    const aliases = new Map([
      ['National Capital Territory of Delhi', 'Delhi'],
      ['NCT of Delhi', 'Delhi'],
    ]);
    const featuresByName = new Map(indiaBoundaries.map((feature) => {
      const sourceName = feature.properties.shapeName;
      return [normalizeRegionName(aliases.get(sourceName) || sourceName), feature];
    }));
    const matched = indianRegions.map((region) => ({
      region,
      feature: featuresByName.get(normalizeRegionName(region.name)),
    })).filter((item) => item.feature);
    if (!matched.length) return { viewBox: '0 0 800 900', shapes: [] };
    let minLongitude = Infinity;
    let maxLongitude = -Infinity;
    let minLatitude = Infinity;
    let maxLatitude = -Infinity;
    matched.forEach(({ feature }) => getFeatureRings(feature.geometry).forEach((ring) => ring.forEach(([longitude, latitude]) => {
      minLongitude = Math.min(minLongitude, longitude);
      maxLongitude = Math.max(maxLongitude, longitude);
      minLatitude = Math.min(minLatitude, latitude);
      maxLatitude = Math.max(maxLatitude, latitude);
    })));
    const longitudeScale = Math.cos(((minLatitude + maxLatitude) / 2) * Math.PI / 180);
    const projectedWidth = (maxLongitude - minLongitude) * longitudeScale;
    const projectedHeight = maxLatitude - minLatitude;
    const scale = Math.min(700 / projectedWidth, 820 / projectedHeight);
    const xOffset = (800 - projectedWidth * scale) / 2;
    const yOffset = (900 - projectedHeight * scale) / 2;
    const project = ([longitude, latitude]) => [
      xOffset + (longitude - minLongitude) * longitudeScale * scale,
      yOffset + (maxLatitude - latitude) * scale,
    ];
    const shapes = matched.map(({ region, feature }) => {
      const path = getFeatureRings(feature.geometry).map((ring) => {
        const stride = Math.max(1, Math.ceil(ring.length / 180));
        const simplified = ring.filter((_, index) => index % stride === 0 || index === ring.length - 1);
        return `${simplified.map((position, index) => {
          const [x, y] = project(position);
          return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
        }).join(' ')} Z`;
      }).join(' ');
      return { region, path };
    });
    return { viewBox: '0 0 800 900', shapes };
  }, [indiaBoundaries]);
  const zoomBy = (amount) => setZoom((current) => Math.min(1.7, Math.max(0.7, Math.round((current + amount) * 10) / 10)));
  const onPage = (nextPage) => {
    setPage(Math.max(0, Math.min(lessons.length - 1, nextPage)));
    setAnswer(null);
  };
  const toggleMapFullscreen = async () => {
    setMapError('');
    try {
      if (document.fullscreenElement === mapCardRef.current) await document.exitFullscreen();
      else await mapCardRef.current?.requestFullscreen();
    } catch (error) {
      setMapError(`Could not change fullscreen mode: ${error.message}`);
    }
  };
  const startCapitalQuiz = () => {
    setCapitalRound(createCapitalRound());
    setSelectedMatchRegion(null);
    setMatchedRegions(new Set());
    setMatchMessage('');
    setLastMatchAttempt(null);
    setIndiaMode('quiz');
  };
  const chooseMatchRegion = (region) => {
    if (matchedRegions.has(region.name)) return;
    setSelectedMatchRegion(region);
    setLastMatchAttempt(null);
    setMatchMessage(`Now choose the capital of ${region.name}.`);
  };
  const chooseMatchCapital = (capital) => {
    if (!selectedMatchRegion) {
      setMatchMessage('Choose a state or union territory on the left first.');
      return;
    }
    if (selectedMatchRegion.name === capital.name) {
      const nextMatched = new Set(matchedRegions);
      nextMatched.add(selectedMatchRegion.name);
      setMatchedRegions(nextMatched);
      setMatchMessage(nextMatched.size === capitalRound.regions.length ? 'Amazing! You matched every capital!' : `Correct! ${capital.capital} is the capital of ${selectedMatchRegion.name}.`);
      setSelectedMatchRegion(null);
      setLastMatchAttempt(null);
    } else {
      setLastMatchAttempt({ region: selectedMatchRegion.name, capital: capital.name });
      setMatchMessage(`Not a match. Try another capital for ${selectedMatchRegion.name}.`);
    }
  };

  useEffect(() => {
    if (page !== 4 || indiaBoundaries.length) return undefined;
    const controller = new AbortController();
    setIndiaMapLoading(true);
    setIndiaMapError('');
    fetch(INDIA_BOUNDARIES_URL, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Boundary data request failed (${response.status}).`);
        return response.json();
      })
      .then((data) => {
        const features = data.features?.filter((feature) => feature.properties?.shapeName && feature.geometry);
        if (!features?.length) throw new Error('Boundary data did not contain usable India state shapes.');
        setIndiaBoundaries(features);
      })
      .catch((error) => {
        if (error.name !== 'AbortError') setIndiaMapError(`Could not load India state boundaries: ${error.message}`);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIndiaMapLoading(false);
      });
    return () => controller.abort();
  }, [page, indiaBoundaries.length]);

  useEffect(() => {
    const syncFullscreen = () => setIsMapFullscreen(document.fullscreenElement === mapCardRef.current);
    document.addEventListener('fullscreenchange', syncFullscreen);
    return () => document.removeEventListener('fullscreenchange', syncFullscreen);
  }, []);

  return (
    <section className="solar-learning">
      <header className="solar-learning-hero">
        <div><span className="eyebrow">{lessons[page].eyebrow}</span><h1>{lessons[page].title}</h1><p>{lessons[page].copy}</p></div>
        <span className="solar-hero-orb" aria-hidden="true">✦</span>
      </header>
      <nav className="solar-lesson-nav" aria-label="Solar system lessons">
        {lessons.map((lesson, index) => (
          <button type="button" key={lesson.title} className={index === page ? 'active' : ''} aria-current={index === page ? 'page' : undefined} onClick={() => onPage(index)}>
            <span>{String(index + 1).padStart(2, '0')}</span>{lesson.title}
          </button>
        ))}
      </nav>

      {page === 0 && <>
        <div className="solar-explorer-card">
          <div className="solar-scene-viewport">
            <div className={`solar-scene ${is3d ? '' : 'solar-scene-flat'} solar-scene-${displayMode}`} style={{ '--solar-zoom': zoom }}>
              <div className="solar-world">
                <div className="solar-sun"><span>Sun</span></div>
                {planets.map((item, index) => (
                  <button type="button" key={item.name} aria-label={`Explore ${item.name}`} aria-pressed={selected === index}
                    className={`solar-orbit ${selected === index ? 'selected' : ''}`}
                    style={{
                      '--orbit-size': `${(displayMode === 'distance' ? 13 + index * 11.5 : 18 + index * 10)}%`,
                      '--orbit-duration': `${(10 + index * 8) / speed}s`,
                      '--planet-color': item.color,
                      '--planet-size': `${displayMode === 'size' ? item.size : 7 + index * 1.1}px`,
                    }}
                    onClick={() => setSelected(index)}>
                    <span className="solar-planet" />{index === selected && <span className="solar-planet-label">{item.name}</span>}
                  </button>
                ))}
              </div>
            </div>
            <div className="solar-zoom-controls" role="group" aria-label="Zoom controls">
              <button type="button" className="secondary" aria-label="Zoom out" disabled={zoom <= 0.7} onClick={() => zoomBy(-0.1)}>−</button>
              <span>{Math.round(zoom * 100)}%</span>
              <button type="button" className="secondary" aria-label="Zoom in" disabled={zoom >= 1.7} onClick={() => zoomBy(0.1)}>+</button>
              <button type="button" className="secondary solar-reset-zoom" onClick={() => setZoom(1)}>Reset</button>
            </div>
          </div>
          <div className="solar-controls">
            <label className="solar-3d-toggle"><input type="checkbox" checked={is3d} onChange={(event) => setIs3d(event.target.checked)} /><span>3D view</span></label>
            <fieldset className="solar-mode-options">
              <legend>Display</legend>
              {['speed', 'size', 'distance'].map((mode) => (
                <label key={mode}><input type="radio" name="solar-display-mode" value={mode} checked={displayMode === mode} onChange={() => setDisplayMode(mode)} /><span>{mode[0].toUpperCase() + mode.slice(1)}</span></label>
              ))}
            </fieldset>
            {displayMode === 'speed' && (
              <label className="solar-speed-control"><span>Orbit speed <strong>{speed.toFixed(1)}×</strong></span><input type="range" min="0.3" max="3" step="0.1" value={speed} onChange={(event) => setSpeed(Number(event.target.value))} aria-label="Orbit speed" /></label>
            )}
          </div>
        </div>
        <nav className="solar-planet-selector" aria-label="Select a planet">
          {planets.map((item, index) => (
            <button type="button" key={item.name} className={selected === index ? 'active' : ''} aria-pressed={selected === index} onClick={() => setSelected(index)}>
              <span className="solar-selector-dot" style={{ '--planet-color': item.color }} />{item.name}
            </button>
          ))}
        </nav>
        <article className="solar-planet-fact" style={{ '--planet-color': planet.color }}>
          <span className="solar-fact-planet" aria-hidden="true" />
          <div className="solar-fact-copy">
            <span className="eyebrow">{planet.type} · PLANET {String(selected + 1).padStart(2, '0')}</span>
            <h2>{planet.name}</h2><p>{planet.fact}</p>
            <div className="solar-planet-stats"><span><small>ORBITAL VELOCITY</small><strong>{planet.velocity}</strong></span><span><small>ORBITAL PERIOD</small><strong>{planet.period}</strong></span><span><small>AVG. DISTANCE FROM SUN</small><strong>{planet.distance}</strong></span></div>
          </div>
        </article>
      </>}

      {page === 1 && <div className="solar-planet-grid">{lessonPlanets[0].map((index) => <PlanetCard key={planets[index].name} planet={planets[index]} number={index + 1} />)}</div>}
      {page === 2 && <div className="solar-planet-grid">{lessonPlanets[1].map((index) => <PlanetCard key={planets[index].name} planet={planets[index]} number={index + 1} />)}</div>}
      {page === 3 && <div className="solar-mission-card">
        <span className="eyebrow">{lessons[page].eyebrow}</span>
        <h2>{missionQuestion}</h2>
        <div className="solar-answer-grid">{planets.slice(0, 4).map((item) => <button type="button" key={item.name} className={answer === item.name ? (item.name === answers[0] ? 'correct' : 'incorrect') : ''} onClick={() => setAnswer(item.name)}>{item.name}</button>)}</div>
        {answer && <p className={answer === answers[0] ? 'solar-feedback correct' : 'solar-feedback'} role="status">{answer === answers[0] ? 'Correct! Mercury is the closest planet to the Sun.' : 'Not quite. Think of the smallest planet, closest to the Sun.'}</p>}
        <div className="solar-completion"><span>Journey complete</span><strong>Solar system lessons explored</strong></div>
      </div>}
      {page === 4 && <section className="india-explorer">
        <div className="india-map-heading">
          <div><span className="eyebrow">28 STATES · 8 UNION TERRITORIES</span><h2>Explore India</h2><p>Hover over or click a state boundary to explore its name and capital.</p></div>
          <div className="india-tools">
            <label className="india-search"><span className="eyebrow">FIND A REGION</span><input value={regionSearch} onChange={(event) => setRegionSearch(event.target.value)} placeholder="Search state or capital" /></label>
            <div className="india-view-toggle" role="group" aria-label="India explorer mode">
              <button type="button" className={indiaMode === 'map' ? 'active' : ''} aria-pressed={indiaMode === 'map'} onClick={() => setIndiaMode('map')}>Explore map</button>
              <button type="button" className={indiaMode === 'quiz' ? 'active' : ''} aria-pressed={indiaMode === 'quiz'} onClick={startCapitalQuiz}>Capital match game</button>
            </div>
          </div>
        </div>
        {mapError && <p className="err" role="alert">{mapError}</p>}
        {indiaMode === 'map' ? <>
        <div className="india-map-card" ref={mapCardRef}>
          <div className="india-map-toolbar">
            <div className="india-map-filters" role="group" aria-label="Filter map regions">
              {['All', 'State', 'Union territory'].map((filter) => (
                <button type="button" key={filter} className={regionFilter === filter ? 'active' : ''} aria-pressed={regionFilter === filter}
                  onClick={() => {
                    setRegionFilter(filter);
                    if (filter !== 'All' && selectedRegion.kind !== filter) {
                      setSelectedRegion(indianRegions.find((region) => region.kind === filter) || selectedRegion);
                    }
                  }}>{filter === 'All' ? 'All regions' : filter === 'State' ? 'States' : 'Union territories'}</button>
              ))}
            </div>
            <button type="button" className="secondary india-fullscreen-button" onClick={toggleMapFullscreen}>{isMapFullscreen ? 'Exit full screen' : '⛶ Full screen'}</button>
          </div>
          <div className="india-map-world">
            <div className="india-map-art" role="group" aria-label="Interactive India state-boundary map" onMouseLeave={() => setHoveredRegion(null)}>
              {indiaMapLoading && <p className="india-map-status">Loading state boundaries…</p>}
              {indiaMapError && <p className="india-map-status error" role="alert">{indiaMapError}</p>}
              {!indiaMapLoading && !indiaMapError && mapShapes.shapes.length > 0 && <svg className="india-map-silhouette" viewBox={mapShapes.viewBox} role="img" aria-label="Map of India with state and union territory boundaries">
                {mapShapes.shapes.filter(({ region }) => visibleRegions.some((visibleRegion) => visibleRegion.name === region.name)).map(({ region, path }) => (
                  <path key={region.name} d={path} className={`india-map-region ${region.kind === 'Union territory' ? 'union-territory' : ''} ${selectedRegion.name === region.name ? 'active' : ''} ${hoveredRegion?.name === region.name ? 'hovered' : ''}`}
                    role="button" tabIndex={0} aria-label={`${region.name}, ${region.kind}, capital ${region.capital}`}
                    aria-pressed={selectedRegion.name === region.name}
                    onMouseEnter={() => setHoveredRegion(region)} onFocus={() => setHoveredRegion(region)}
                    onClick={() => setSelectedRegion(region)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        setSelectedRegion(region);
                      }
                    }} />
                ))}
                {visibleRegions.length === 0 && <text x="400" y="450" className="india-map-empty">No matching region.</text>}
              </svg>}
              {!indiaMapLoading && !indiaMapError && !mapShapes.shapes.length && indiaBoundaries.length > 0 && <p className="india-map-status error">Boundary data loaded, but no regions could be matched.</p>}
            </div>
            <aside className="india-map-info">
              <span className="eyebrow">EXPLORE INDIA</span>
              <h3>{displayRegion.name}</h3>
              <p>{displayRegion.kind}</p>
              <div className="india-map-capital"><span>CAPITAL</span><strong>{displayRegion.capital}</strong></div>
              <small>Hover over a marker to preview. Click to keep this region selected.</small>
              <div className="india-map-neighbors"><span>NEAR INDIA</span><strong>Pakistan · Nepal · Bhutan · Bangladesh · Myanmar</strong></div>
            </aside>
          </div>
          <div className="india-map-legend"><span><i /> State</span><span><i /> Union territory</span><span>Hover or select a region to explore</span><small>{INDIA_BOUNDARY_ATTRIBUTION} <a href="https://www.geoboundaries.org/" target="_blank" rel="noreferrer">Source and license</a></small></div>
        </div>
        <article className="india-region-detail">
          <span className={`india-region-mark ${displayRegion.kind === 'Union territory' ? 'union-territory' : ''}`} aria-hidden="true">IN</span>
          <div><span className="eyebrow">{displayRegion.kind.toUpperCase()}</span><h3>{displayRegion.name}</h3><p>Capital: <strong>{displayRegion.capital}</strong></p></div>
        </article>
        <div className="india-region-list" aria-label="All states and union territories">
          {visibleRegions.map((region) => (
            <button type="button" key={region.name} className={selectedRegion.name === region.name ? 'active' : ''} onClick={() => setSelectedRegion(region)}>
              <span><strong>{region.name}</strong><small>{region.kind}</small></span><b>{region.capital}</b>
            </button>
          ))}
        </div>
        </> : <section className="india-capital-game">
          <div className="india-game-heading"><span className="eyebrow">CAPITAL CHALLENGE · MATCH LEFT TO RIGHT</span><h3>Connect each region to its capital</h3><p>Match all 28 states and 8 union territories. Select a region, then its capital.</p></div>
          <div className="india-game-score"><strong>{matchedRegions.size}<small>/{capitalRound.regions.length}</small></strong><span>PAIRS MATCHED</span></div>
          <div className="india-match-board">
            <div className="india-match-column"><h4>STATES & TERRITORIES</h4>
              {capitalRound.regions.map((region, index) => <button type="button" key={region.name}
                className={`india-match-option ${selectedMatchRegion?.name === region.name ? 'selected' : ''} ${lastMatchAttempt?.region === region.name ? 'wrong' : ''} ${matchedRegions.has(region.name) ? 'matched' : ''}`}
                disabled={matchedRegions.has(region.name)} onClick={() => chooseMatchRegion(region)}>
                <span>{String(index + 1).padStart(2, '0')}</span>{region.name}{matchedRegions.has(region.name) && <b>✓</b>}
              </button>)}
            </div>
            <div className="india-match-connector" aria-hidden="true">→</div>
            <div className="india-match-column"><h4>CAPITALS</h4>
              {capitalRound.capitals.map((region) => <button type="button" key={region.name}
                className={`india-match-option ${lastMatchAttempt?.capital === region.name ? 'wrong' : ''} ${matchedCapitals.has(region.name) ? 'matched' : ''}`}
                disabled={matchedCapitals.has(region.name)}
                onClick={() => chooseMatchCapital(region)}>{region.capital}<span aria-hidden="true">⌖</span></button>)}
            </div>
          </div>
          <p className={`india-game-message ${matchMessage.startsWith('Correct') || matchMessage.startsWith('Amazing') ? 'correct' : ''}`} role="status">{matchMessage || 'Pick a name from the left column to begin.'}</p>
          {matchedRegions.size === capitalRound.regions.length && <button type="button" onClick={startCapitalQuiz}>Play another round ↻</button>}
        </section>}
        <section className="india-neighbors">
          <div><span className="eyebrow">AROUND INDIA</span><h3>Neighboring countries</h3><p>India shares land borders with these countries and has maritime neighbors across the Indian Ocean.</p></div>
          <div className="india-neighbor-grid">
            {neighboringCountries.map((country) => <article key={country.name}><span aria-hidden="true">✦</span><strong>{country.name}</strong><small>{country.relation}</small></article>)}
          </div>
          <p className="india-border-note">The India–Afghanistan border is based on India’s territorial claim in the region administered by Pakistan; the boundary is disputed.</p>
        </section>
      </section>}

      <footer className="solar-page-actions">
        <button type="button" className="secondary" disabled={page === 0} onClick={() => onPage(page - 1)}>← Previous lesson</button>
        <span>Page {page + 1} of {lessons.length}</span>
        <button type="button" disabled={page === lessons.length - 1} onClick={() => onPage(page + 1)}>Next lesson →</button>
      </footer>
    </section>
  );
}

function PlanetCard({ planet, number }) {
  return <article className="solar-planet-card" style={{ '--planet-color': planet.color }}>
    <div className="solar-card-top"><span className="solar-card-planet" aria-hidden="true" /><span className="eyebrow">PLANET {String(number).padStart(2, '0')}</span></div>
    <h2>{planet.name}</h2><span className="solar-planet-type">{planet.type}</span><p>{planet.fact}</p>
  </article>;
}
