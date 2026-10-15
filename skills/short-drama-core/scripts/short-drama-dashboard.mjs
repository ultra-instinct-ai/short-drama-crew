import { existsSync, readdirSync, statSync } from 'node:fs'
import { basename, dirname, extname, isAbsolute, join, relative, resolve, sep } from 'node:path'
import { pathToFileURL } from 'node:url'

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'])
const VIDEO_EXTENSIONS = new Set(['.mp4', '.webm', '.mov', '.m4v'])

function esc(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function text(value, fallback = '—') {
  const out = String(value ?? '').trim()
  return out || fallback
}

function list(value) {
  return Array.isArray(value) ? value.filter(Boolean) : []
}

function sum(items, pick = (it) => it) {
  return items.reduce((total, item) => total + (Number(pick(item)) || 0), 0)
}

function pad2(value) {
  return String(value).padStart(2, '0')
}

function isMediaFile(name) {
  const ext = extname(name).toLowerCase()
  return IMAGE_EXTENSIONS.has(ext) || VIDEO_EXTENSIONS.has(ext)
}

function walkImages(root, files = [], depth = 0) {
  if (!root || !existsSync(root) || depth > 6) return files
  for (const name of readdirSync(root)) {
    if (name.startsWith('.') || name === 'node_modules') continue
    const path = join(root, name)
    const stats = statSync(path)
    if (stats.isDirectory()) walkImages(path, files, depth + 1)
    else if (isMediaFile(name)) files.push(path)
  }
  return files
}

function imageIndex(roots) {
  const files = [...new Set(roots.flatMap((root) => walkImages(root)))]
  return files.map((path) => ({
    path,
    key: basename(path, extname(path)).toLowerCase(),
    full: path.toLowerCase(),
  }))
}

function rawAsset(value) {
  if (!value) return { source: '', kind: '' }
  if (typeof value === 'object') {
    return {
      source: value.url || value.src || value.path || value.file || value.id || '',
      kind: value.type || value.kind || '',
    }
  }
  return { source: String(value), kind: '' }
}

function mediaKind(source, declared = '') {
  const named = String(declared).toLowerCase()
  if (named === 'video' || named === 'image') return named
  const ext = extname(String(source).split(/[?#]/)[0]).toLowerCase()
  return VIDEO_EXTENSIONS.has(ext) ? 'video' : 'image'
}

function localImageHref(path, outputPath) {
  const rel = relative(dirname(outputPath), path)
  if (rel && !rel.startsWith('..') && !isAbsolute(rel)) {
    return rel.split(sep).join('/')
  }
  return pathToFileURL(path).href
}

function resolveMedia(value, media) {
  const { source, kind } = rawAsset(value)
  if (!source) return null
  if (/^(https?:|data:|file:)/i.test(source)) {
    return { href: source, kind: mediaKind(source, kind) }
  }
  const localCandidates = [
    isAbsolute(source) ? source : '',
    join(media.projectDir, source),
    join(media.projectDir, 'assets', source),
  ].filter(Boolean)
  for (const path of localCandidates) {
    if (existsSync(path) && statSync(path).isFile()) {
      return { href: localImageHref(path, media.outputPath), kind: mediaKind(path, kind) }
    }
  }
  const lower = source.toLowerCase()
  const found = media.files.find((item) => item.key === lower)
    || media.files.find((item) => item.full.includes(lower))
  if (!found) return null
  return { href: localImageHref(found.path, media.outputPath), kind: mediaKind(found.path, kind) }
}

function entityMedia(entity, media) {
  const assets = entity?.wji?.assets || {}
  const candidates = [
    typeof entity?.image === 'string' ? entity.image : '',
    entity?.image?.url,
    entity?.image?.src,
    entity?.image?.path,
    entity?.image?.file,
    assets.sheet,
    assets.headshot,
    assets.keyframe,
    assets.poster,
    entity?.video,
    assets.video,
  ]
  for (const candidate of candidates) {
    const resolved = resolveMedia(candidate, media)
    if (resolved) return resolved
  }
  const id = String(entity?.id || '').toLowerCase()
  const hinted = media.files.find((item) => id && item.full.includes(id))
  if (!hinted) return null
  return { href: localImageHref(hinted.path, media.outputPath), kind: mediaKind(hinted.path) }
}

function badge(label, tone = '') {
  return `<span class="badge ${tone}">${esc(label)}</span>`
}

function placeholder(label, hidden) {
  return `<div class="visual-empty"${hidden ? ' hidden' : ''}>
    <svg viewBox="0 0 64 48" aria-hidden="true"><rect x="1.5" y="1.5" width="61" height="45" rx="2"></rect><path d="M8 36l12-12 8 8 10-13 18 17"></path><circle cx="20" cy="15" r="4"></circle></svg>
    <span>图片占位</span>
    <small>${esc(label)} · 可填 WJI 图片 / 视频地址，或本地文件</small>
  </div>`
}

function figure(resolved, alt, caption = '') {
  const media = !resolved?.href
    ? ''
    : resolved.kind === 'video'
      ? `<video src="${esc(resolved.href)}" controls preload="metadata" playsinline onerror="this.hidden=true;this.nextElementSibling.hidden=false"></video>`
      : `<img src="${esc(resolved.href)}" alt="${esc(alt)}" loading="lazy" onerror="this.hidden=true;this.nextElementSibling.hidden=false">`
  return `<figure class="visual">${media}${placeholder(alt, Boolean(resolved?.href))}${caption ? `<figcaption>${esc(caption)}</figcaption>` : ''}</figure>`
}

function sectionTitle(index, title, note = '') {
  return `<header class="section-head"><span>${String(index).padStart(2, '0')}</span><h2>${esc(title)}</h2>${note ? `<p>${esc(note)}</p>` : ''}</header>`
}

function field(label, value) {
  return `<div class="field"><dt>${esc(label)}</dt><dd>${esc(text(value))}</dd></div>`
}

function promptBlock(title, value) {
  if (!String(value || '').trim()) return ''
  return `<details class="prompt"><summary>${esc(title)}</summary><div>${esc(value)}</div></details>`
}

function overview(project, episodes, gateResults) {
  const episodeList = Object.values(episodes)
  const segments = episodeList.flatMap((episode) => list(episode.storyboard?.segments))
  const cuts = segments.flatMap((segment) => list(segment.cuts))
  const dialogue = episodeList.flatMap((episode) =>
    list(episode.scenes).flatMap((scene) => list(scene.flow).filter((it) => it.speaker && it.line)),
  )
  const plannedSeconds = sum(cuts, (cut) => cut.seconds)
    || sum(episodeList, (episode) => episode.targetSeconds)
  const hard = gateResults.filter((gate) => !gate.skipped && !gate.advisory)
  const failed = hard.filter((gate) => list(gate.failures).length)
  const passed = hard.length - failed.length
  const stats = [
    ['集数', `${episodeList.length} / ${project.params?.episodes || 0}`],
    ['人物', list(project.characters).length],
    ['场景', list(project.scenes).length],
    ['分镜段', segments.length],
    ['镜头', cuts.length],
    ['对白', `${dialogue.length} 句`],
    ['计划时长', `${Math.round(plannedSeconds)} 秒`],
    ['校验', failed.length ? `${passed}/${hard.length} 通过` : `${passed}/${hard.length} 通过`],
  ]
  return `
    <section id="overview" class="page-section">
      ${sectionTitle(1, '制作总览', '项目参数、生产规模与校验状态')}
      <div class="stats">${stats.map(([label, value]) => `<div><strong>${esc(value)}</strong><span>${esc(label)}</span></div>`).join('')}</div>
      <div class="overview-grid">
        <article class="brief">
          <h3>${esc(project.title)}</h3>
          <p class="logline">${esc(text(project.outline?.brief?.logline || project.outline?.core))}</p>
          <dl>
            ${field('类型', project.params?.genre)}
            ${field('语体', project.params?.register)}
            ${field('画幅', project.params?.ratio)}
            ${field('视频模式', project.params?.video)}
            ${field('影像风格', project.params?.style)}
            ${field('摄影基调', project.params?.cinematography)}
          </dl>
        </article>
        <article class="gate-report">
          <h3>阶段体检</h3>
          ${failed.length
            ? failed.slice(0, 8).map((gate) => `<div class="gate bad"><b>${esc(gate.stage)} / ${esc(gate.id)}</b><span>${esc(gate.label)}</span><small>${esc(gate.failures[0])}</small></div>`).join('')
            : '<div class="all-clear"><b>全部硬性校验已通过</b><span>项目数据可以继续进入下一制作环节。</span></div>'}
        </article>
      </div>
    </section>`
}

function story(project) {
  const outline = project.outline || {}
  const brief = outline.brief || {}
  return `
    <section id="story" class="page-section">
      ${sectionTitle(2, '故事设计', '创作承诺、结构推进与剧集目录')}
      <div class="story-grid">
        <article class="story-core">
          <h3>核心命题</h3>
          <p>${esc(text(outline.core))}</p>
          <dl>
            ${field('观众', brief.audience)}
            ${field('满足引擎', brief.satisfactionEngine)}
            ${field('主钩子', brief.mainHook)}
            ${field('情感线', brief.emotionalLine)}
            ${field('兑现承诺', brief.promise)}
          </dl>
        </article>
        <article class="guideline">
          <h3>创作指引</h3>
          <p>${esc(text(outline.guideline?.tone))}</p>
          <dl>
            ${field('情绪', outline.guideline?.emotionalIntensity)}
            ${field('对白', outline.guideline?.dialogueStyle)}
            ${field('视觉', outline.guideline?.visualStyle)}
            ${field('限制', outline.guideline?.productionLimits)}
          </dl>
        </article>
      </div>
      <div class="episode-directory">
        ${list(outline.episodes).map((episode) => `
          <article>
            <span class="episode-no">E${pad2(episode.ep)}</span>
            <div>
              <h3>${esc(list(episode.function).join(' / ') || `第 ${episode.ep} 集`)}</h3>
              <p>${esc(text(episode.synopsis))}</p>
              <footer>${badge(episode.hookType || '钩子', 'rust')}<span>${esc(text(episode.hook))}</span></footer>
            </div>
          </article>`).join('')}
      </div>
    </section>`
}

function characters(project, media) {
  return `
    <section id="characters" class="page-section">
      ${sectionTitle(3, '人物设定', '人物弧、表演指引与视觉资产')}
      <div class="character-list">
        ${list(project.characters).map((character) => {
          const profile = character.profile || {}
          const bible = character.bible || {}
          const visual = entityMedia(character, media)
          return `<article class="character-card">
            <div class="character-visual">${figure(visual, `${character.name} 角色设定图`)}</div>
            <div class="character-copy">
              <header><span>${esc(character.id)}</span><h3>${esc(character.name)}</h3>${badge(character.tier || 'character')}</header>
              <p class="role">${esc(text(character.role))}</p>
              <p class="one-liner">${esc(text(character.oneLiner))}</p>
              <div class="character-columns">
                <dl>
                  ${field('身份', profile.identity)}
                  ${field('年龄', profile.ageRange)}
                  ${field('外形', profile.appearance)}
                  ${field('性格', list(profile.personality).join('、'))}
                  ${field('动机', profile.motivation)}
                </dl>
                <dl>
                  ${field('想要', bible.want)}
                  ${field('需要', bible.need)}
                  ${field('误信', bible.misbelief)}
                  ${field('矛盾', bible.contradiction)}
                  ${field('人物弧', character.arc)}
                </dl>
              </div>
              <blockquote>${esc(text(bible.hookLine || character.voice?.sample?.line))}</blockquote>
              <div class="voice-line">${badge('声音', 'quiet')}<span>${esc([character.voice?.timbre, character.voice?.pace, character.voice?.accent].filter(Boolean).join('；') || '—')}</span></div>
              ${promptBlock('角色图提示词', character.image?.prompt)}
              ${promptBlock('角色设定图提示词', character.image?.sheet)}
            </div>
          </article>`
        }).join('')}
      </div>
    </section>`
}

function world(project, media) {
  const sceneCards = list(project.scenes).map((scene) => {
    const visual = entityMedia(scene, media)
    return `<article class="world-card">
      <header><span>${esc(scene.id)}</span><h3>${esc(scene.name)}</h3>${scene.primary ? badge('主场景', 'rust') : ''}</header>
      <p>${esc(text(scene.summary))}</p>
      ${figure(visual, `${scene.name} 场景设定图`)}
      <h4>视觉锚点</h4>
      <ol>${list(scene.anchors).map((anchor) => `<li><b>${esc(anchor.name)}</b><span>${esc(anchor.desc)}</span></li>`).join('')}</ol>
      <h4>光照状态</h4>
      ${list(scene.lighting).map((state) => `<div class="lighting"><b>${esc(state.state)}</b><span>${esc(state.prompt)}</span></div>`).join('')}
      ${promptBlock('场景主提示词', scene.image?.prompt)}
      ${promptBlock('场景设定图提示词', scene.image?.sheet)}
    </article>`
  }).join('')
  const propCards = list(project.props).map((prop) => {
    const visual = entityMedia(prop, media)
    return `<article class="world-card prop-card">
      <header><span>${esc(prop.id)}</span><h3>${esc(prop.name)}</h3>${badge(prop.scale || '道具')}</header>
      <p>${esc(text(prop.function || prop.summary))}</p>
      ${figure(visual, `${prop.name} 道具设定图`)}
      <h4>状态</h4>
      ${list(prop.states).map((state) => `<div class="lighting"><b>${esc(state.state)}</b><span>${esc(state.prompt)}</span></div>`).join('')}
      ${promptBlock('道具提示词', prop.image?.prompt)}
      ${promptBlock('道具设定图提示词', prop.image?.sheet)}
    </article>`
  }).join('')
  return `
    <section id="world" class="page-section">
      ${sectionTitle(4, '场景与道具', '空间连续性、灯光状态与叙事物件')}
      <div class="world-grid">${sceneCards}${propCards}</div>
    </section>`
}

function scriptFlow(project, episode) {
  const characters = new Map(list(project.characters).map((it) => [it.id, it.name]))
  return list(episode.scenes).map((scene, sceneIndex) => {
    const sceneRef = list(project.scenes).find((it) => it.id === scene.sceneId)
    return `<article class="script-scene">
      <header><span>${String(sceneIndex + 1).padStart(2, '0')}</span><h4>${esc(sceneRef?.name || scene.sceneId)}</h4>${badge(scene.lighting || '灯光')}</header>
      <div class="flow">
        ${list(scene.flow).map((item) => item.speaker
          ? `<div class="line"><b>${esc(characters.get(item.speaker) || item.speaker)}</b><p>${esc(item.line)}</p><small>${esc(text(item.delivery, ''))}</small></div>`
          : `<p class="action">${esc(item.action)}</p>`).join('')}
      </div>
    </article>`
  }).join('')
}

function storyboard(episode, media) {
  return list(episode.storyboard?.segments).map((segment) => {
    const seconds = sum(list(segment.cuts), (cut) => cut.seconds)
    const visual = entityMedia(segment, media)
    return `<article class="segment">
      <header>
        <h4>${esc(segment.id)}</h4>
        <span>${esc(`${list(segment.cuts).length} 镜 · ${seconds || '—'} 秒`)}</span>
      </header>
      ${figure(visual, `${segment.id} 分镜素材`)}
      <div class="cut-strip">
        ${list(segment.cuts).map((cut, index) => `<div title="${esc(cut.purpose?.change || cut.frame)}"><b>${String(index + 1).padStart(2, '0')}</b><span>${esc(cut.size || 'shot')}</span><i style="--seconds:${Number(cut.seconds) || 1}"></i></div>`).join('')}
      </div>
      <ol class="cut-list">
        ${list(segment.cuts).map((cut, index) => `<li><span>${String(index + 1).padStart(2, '0')}</span><div><b>${esc([cut.size, cut.camera, `${cut.seconds || '—'}s`].filter(Boolean).join(' / '))}</b><p>${esc(text(cut.purpose?.change || cut.motion?.action || cut.frame))}</p></div></li>`).join('')}
      </ol>
      ${promptBlock('视频提示词', segment.videoPrompt || segment.prompt)}
    </article>`
  }).join('')
}

function episodesSection(project, episodes, media) {
  return `
    <section id="episodes" class="page-section">
      ${sectionTitle(5, '分集剧本与分镜', '对白、动作、镜头节奏与生成计划')}
      <div class="episode-list">
        ${Object.entries(episodes).map(([epNo, episode]) => {
          const seconds = sum(list(episode.storyboard?.segments).flatMap((segment) => list(segment.cuts)), (cut) => cut.seconds)
          return `<article class="episode">
            <header class="episode-head">
              <div><span>E${pad2(epNo)}</span><h3>${esc(list(episode.function).join(' / ') || `第 ${epNo} 集`)}</h3></div>
              <dl><dt>计划时长</dt><dd>${esc(seconds || episode.targetSeconds || '—')} 秒</dd><dt>钩子</dt><dd>${esc(text(episode.hookType))}</dd></dl>
            </header>
            <div class="episode-premise"><b>开场</b><span>${esc(text(episode.hook))}</span><b>落点</b><span>${esc(text(episode.cliff))}</span></div>
            <details class="episode-detail" open>
              <summary>分集剧本</summary>
              <div class="script-grid">${scriptFlow(project, episode)}</div>
            </details>
            <details class="episode-detail" open>
              <summary>分镜表</summary>
              <div class="segment-grid">${storyboard(episode, media)}</div>
            </details>
          </article>`
        }).join('')}
      </div>
    </section>`
}

function navigation(project, episodes) {
  return `<aside class="rail">
    <a class="brand" href="#overview"><b>${esc(project.title)}</b><span>短剧制作档案</span></a>
    <nav>
      <a href="#overview"><span>01</span>制作总览</a>
      <a href="#story"><span>02</span>故事设计</a>
      <a href="#characters"><span>03</span>人物设定 <i>${list(project.characters).length}</i></a>
      <a href="#world"><span>04</span>场景与道具 <i>${list(project.scenes).length + list(project.props).length}</i></a>
      <a href="#episodes"><span>05</span>分集剧本 <i>${Object.keys(episodes).length}</i></a>
    </nav>
    <footer>由 WJI short-drama 项目生成<br>${new Date().toLocaleString('zh-CN', { hour12: false })}</footer>
  </aside>`
}

const CSS = `
:root{--paper:#f3f4f0;--surface:#ffffff;--ink:#333333;--muted:#6d7064;--rule:#d1d3cc;--rust:#56720a;--sage:#7a9a12;--soft:#e8e9e5;--shadow:rgba(51,51,51,.08)}
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--paper);color:var(--ink);font-family:"Noto Sans CJK SC","PingFang SC","Microsoft YaHei",sans-serif;font-size:14px;line-height:1.65}
button,input{font:inherit}a{color:inherit;text-decoration:none}.shell{display:grid;grid-template-columns:224px minmax(0,1fr);min-height:100vh}.rail{position:sticky;top:0;height:100vh;padding:30px 22px;border-right:1px solid var(--rule);background:#eaebe5;display:flex;flex-direction:column}.brand{padding-bottom:28px;border-bottom:1px solid var(--ink)}.brand b{display:block;font-family:"Songti SC","STSong",serif;font-size:21px;font-weight:600}.brand span{font-size:11px;color:var(--muted)}.rail nav{display:flex;flex-direction:column;padding-top:18px}.rail nav a{display:grid;grid-template-columns:28px 1fr auto;gap:8px;padding:10px 0;border-bottom:1px solid rgba(0,0,0,.08)}.rail nav span{font-family:Georgia,serif;color:var(--rust);font-size:11px}.rail nav i{font-style:normal;color:var(--muted);font-size:11px}.rail footer{margin-top:auto;color:var(--muted);font-size:10px}.content{min-width:0;padding:0 34px 80px}.masthead{position:sticky;top:0;z-index:20;height:58px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--ink);background:rgba(243,244,240,.94);backdrop-filter:blur(8px)}.masthead h1{font-family:"Songti SC","STSong",serif;font-size:22px;font-weight:500;margin:0}.masthead p{margin:0;color:var(--muted);font-size:11px}.page-section{padding:42px 0 18px;scroll-margin-top:58px}.section-head{display:grid;grid-template-columns:34px auto 1fr;align-items:baseline;gap:8px;padding-bottom:10px;margin-bottom:18px;border-bottom:1px solid var(--ink)}.section-head>span{color:var(--rust);font-family:Georgia,serif;font-size:11px}.section-head h2{font-family:"Songti SC","STSong",serif;font-size:19px;font-weight:500;margin:0}.section-head p{justify-self:end;margin:0;color:var(--muted);font-size:11px}.stats{display:grid;grid-template-columns:repeat(8,minmax(85px,1fr));border:1px solid var(--rule);background:var(--surface)}.stats div{padding:14px 13px;border-right:1px solid var(--rule)}.stats div:last-child{border:0}.stats strong{display:block;font-family:"Songti SC","STSong",serif;font-size:21px;font-weight:500}.stats span{display:block;color:var(--muted);font-size:10px}.overview-grid,.story-grid{display:grid;grid-template-columns:1.45fr 1fr;gap:16px;margin-top:16px}.brief,.gate-report,.story-core,.guideline{border:1px solid var(--rule);background:var(--surface);padding:20px}.brief h3,.gate-report h3,.story-core h3,.guideline h3{font-family:"Songti SC","STSong",serif;font-size:17px;margin:0 0 10px}.logline,.story-core>p,.guideline>p{font-family:"Songti SC","STSong",serif;font-size:16px;line-height:1.9;margin:0 0 16px}.brief dl,.story-grid dl,.character-columns dl{margin:0}.field{display:grid;grid-template-columns:82px 1fr;gap:10px;padding:7px 0;border-top:1px solid var(--soft)}.field dt{color:var(--rust);font-size:11px}.field dd{margin:0}.gate{display:grid;grid-template-columns:110px 1fr;gap:8px;padding:8px 0;border-top:1px solid var(--soft)}.gate b{font-size:11px;color:var(--rust)}.gate small{grid-column:2;color:var(--muted)}.all-clear{min-height:180px;display:flex;flex-direction:column;align-items:center;justify-content:center;border:1px dashed var(--sage);color:var(--sage)}.all-clear b{font-family:"Songti SC","STSong",serif;font-size:17px}.all-clear span{font-size:11px}.badge{display:inline-flex;align-items:center;padding:1px 7px;border:1px solid var(--rule);border-radius:20px;color:var(--muted);font-size:10px;font-weight:400;white-space:nowrap}.badge.rust{border-color:var(--rust);color:var(--rust)}.badge.quiet{border:0;padding-left:0;color:var(--rust)}.episode-directory{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-top:16px}.episode-directory article{display:grid;grid-template-columns:48px 1fr;gap:12px;padding:16px;border:1px solid var(--rule);background:var(--surface)}.episode-no{font-family:Georgia,serif;font-size:16px;color:var(--rust)}.episode-directory h3{margin:0;font-family:"Songti SC","STSong",serif;font-weight:500}.episode-directory p{color:var(--muted)}.episode-directory footer{display:flex;gap:8px;align-items:flex-start;font-size:11px}.character-list{display:flex;flex-direction:column;gap:18px}.character-card{display:grid;grid-template-columns:minmax(300px,42%) 1fr;border:1px solid var(--rule);background:var(--surface)}.character-visual{border-right:1px solid var(--rule);min-height:420px}.visual{height:100%;margin:0;display:flex;flex-direction:column;background:#fff}.visual img,.visual video{display:block;width:100%;height:100%;min-height:240px;object-fit:contain;background:#1a1b18}.visual figcaption{padding:6px 10px;color:var(--muted);font-size:10px;border-top:1px solid var(--soft)}.visual-empty{min-height:260px;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;padding:24px;text-align:center;background:repeating-linear-gradient(135deg,#f7fce8,#f7fce8 8px,#eef9cc 8px,#eef9cc 16px);color:var(--muted)}.visual-empty[hidden]{display:none}.visual-empty svg{width:64px;height:48px;fill:none;stroke:currentColor;stroke-width:1.5}.visual-empty span{font-family:"Songti SC","STSong",serif}.visual-empty small{max-width:220px;font-size:10px}.character-copy{padding:20px}.character-copy header,.world-card header{display:flex;align-items:center;gap:9px;border-bottom:1px solid var(--rule);padding-bottom:9px}.character-copy header>span,.world-card header>span{color:var(--rust);font-family:Georgia,serif;font-size:11px}.character-copy h3,.world-card h3{font-family:"Songti SC","STSong",serif;font-size:20px;font-weight:500;margin:0}.role{color:var(--rust);font-size:11px}.one-liner{font-family:"Songti SC","STSong",serif;font-size:15px}.character-columns{display:grid;grid-template-columns:1fr 1fr;gap:20px}.character-copy blockquote{margin:14px 0 8px;padding:8px 14px;border-left:2px solid var(--rust);font-family:"Songti SC","STSong",serif}.voice-line{display:flex;gap:8px;color:var(--muted);font-size:11px}.prompt{border-top:1px solid var(--soft);margin-top:8px}.prompt summary{padding:8px 0;cursor:pointer;font-size:11px}.prompt div{padding:10px;background:var(--soft);color:var(--muted);font-size:11px;white-space:pre-wrap}.world-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;align-items:start}.world-card{padding:16px;border:1px solid var(--rule);background:var(--surface)}.world-card>p{min-height:46px}.world-card .visual{height:330px;border:1px solid var(--soft)}.world-card h4{font-family:"Songti SC","STSong",serif;font-weight:500;margin:16px 0 5px}.world-card ol{list-style:none;padding:0;margin:0}.world-card li,.lighting{display:grid;grid-template-columns:130px 1fr;gap:10px;padding:7px 0;border-top:1px solid var(--soft)}.world-card li b,.lighting b{font-size:11px;color:var(--rust)}.world-card li span,.lighting span{font-size:11px;color:var(--muted)}.episode-list{display:flex;flex-direction:column;gap:26px}.episode{border-top:2px solid var(--ink)}.episode-head{display:flex;justify-content:space-between;padding:13px 0}.episode-head>div{display:flex;align-items:center;gap:10px}.episode-head span{font-family:Georgia,serif;color:var(--rust)}.episode-head h3{font-family:"Songti SC","STSong",serif;font-size:18px;font-weight:500;margin:0}.episode-head dl{display:grid;grid-template-columns:auto auto;gap:1px 9px;margin:0;font-size:10px}.episode-head dt{color:var(--muted)}.episode-head dd{margin:0}.episode-premise{display:grid;grid-template-columns:50px 1fr 50px 1fr;gap:10px;padding:12px;background:var(--surface);border:1px solid var(--rule)}.episode-premise b{color:var(--rust);font-size:11px}.episode-detail{margin-top:12px;border:1px solid var(--rule);background:var(--surface)}.episode-detail>summary{padding:10px 14px;cursor:pointer;border-bottom:1px solid var(--rule);font-family:"Songti SC","STSong",serif}.script-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;padding:12px}.script-scene{border:1px solid var(--soft);padding:12px}.script-scene header{display:flex;gap:8px;align-items:center;border-bottom:1px solid var(--rule)}.script-scene header>span{font-family:Georgia,serif;color:var(--rust);font-size:10px}.script-scene h4{font-family:"Songti SC","STSong",serif;font-weight:500;margin:0}.flow{padding-top:8px}.action{padding:7px 9px;margin:5px 0;background:#f7fce8;border-left:2px solid var(--rust);font-family:"Songti SC","STSong",serif}.line{display:grid;grid-template-columns:72px 1fr;gap:4px 10px;padding:7px 0;border-bottom:1px solid var(--soft)}.line b{font-size:11px}.line p{margin:0;font-family:"Songti SC","STSong",serif;font-size:15px}.line small{grid-column:2;color:var(--muted)}.segment-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;padding:12px}.segment{border:1px solid var(--rule);padding:12px}.segment>header{display:flex;justify-content:space-between;border-bottom:1px solid var(--rule)}.segment h4{font-family:Georgia,serif;color:var(--rust);margin:0}.segment>header span{font-size:10px;color:var(--muted)}.cut-strip{height:34px;display:flex;gap:2px;margin:12px 0}.cut-strip div{position:relative;display:flex;flex-direction:column;justify-content:center;min-width:34px;flex:var(--seconds);padding:2px 5px;background:var(--soft);overflow:hidden}.cut-strip div:nth-child(4n+1){border-top:3px solid #56720a}.cut-strip div:nth-child(4n+2){border-top:3px solid #7a9a12}.cut-strip div:nth-child(4n+3){border-top:3px solid #9cb92a}.cut-strip div:nth-child(4n){border-top:3px solid #b5d42e}.cut-strip b{font-size:9px}.cut-strip span{font-size:8px;color:var(--muted)}.cut-strip i{display:none}.cut-list{list-style:none;margin:0;padding:0}.cut-list li{display:grid;grid-template-columns:30px 1fr;gap:8px;padding:8px 0;border-top:1px solid var(--soft)}.cut-list>li>span{font-family:Georgia,serif;color:var(--rust);font-size:10px}.cut-list b{font-size:10px}.cut-list p{margin:2px 0;color:var(--muted);font-size:11px}.segment .visual{height:220px;margin-top:10px}
@media(max-width:1050px){.shell{grid-template-columns:1fr}.rail{position:static;height:auto;border-right:0;border-bottom:1px solid var(--rule)}.rail nav{display:grid;grid-template-columns:repeat(5,1fr)}.rail nav a{padding-right:12px}.rail footer{display:none}.stats{grid-template-columns:repeat(4,1fr)}.stats div:nth-child(4){border-right:0}.character-card{grid-template-columns:1fr}.character-visual{border-right:0;border-bottom:1px solid var(--rule)}}
@media(max-width:720px){.content{padding:0 14px 50px}.rail{padding:18px 14px}.rail nav{grid-template-columns:1fr 1fr}.section-head{grid-template-columns:28px 1fr}.section-head p{display:none}.stats{grid-template-columns:repeat(2,1fr)}.stats div:nth-child(even){border-right:0}.overview-grid,.story-grid,.world-grid,.script-grid,.segment-grid,.episode-directory{grid-template-columns:1fr}.character-columns{grid-template-columns:1fr}.character-visual{min-height:280px}.episode-premise{grid-template-columns:48px 1fr}.episode-head{align-items:flex-start}.episode-head dl{display:none}}
@media print{.rail{display:none}.shell{display:block}.content{padding:0}.masthead{position:static}.page-section{break-before:page}.page-section:first-of-type{break-before:auto}.prompt{display:none}.episode-detail{break-inside:avoid}}
`

export function renderDashboard(opts) {
  const projectDir = resolve(opts.projectDir)
  const outputPath = resolve(opts.outputPath)
  const roots = [opts.assetsDir, join(projectDir, 'assets'), join(projectDir, 'output'), projectDir]
    .filter(Boolean)
    .map((root) => resolve(root))
  const media = {
    files: imageIndex(roots),
    projectDir,
    outputPath,
  }
  const project = opts.project
  const episodes = opts.episodes || {}
  const gateResults = opts.gateResults || []
  return `<!doctype html>
<html lang="${esc(project.lang || 'zh')}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light">
  <title>${esc(project.title)} · 短剧制作档案</title>
  <style>${CSS}</style>
</head>
<body>
  <div class="shell">
    ${navigation(project, episodes)}
    <main class="content">
      <header class="masthead"><h1>${esc(project.title)}</h1><p>${esc(`第 1–${project.params?.episodes || Object.keys(episodes).length} 集 · ${project.params?.genre || '短剧'} · ${project.params?.ratio || '—'}`)}</p></header>
      ${overview(project, episodes, gateResults)}
      ${story(project)}
      ${characters(project, media)}
      ${world(project, media)}
      ${episodesSection(project, episodes, media)}
    </main>
  </div>
</body>
</html>`
}
