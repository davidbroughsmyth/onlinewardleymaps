export default class MapElements {
	// this is a messs...
	constructor(components, evolved, pipelines, subMaps) {
		this.mapComponents = components
			.map(c => Object.assign(c, { type: 'component' }))
			.concat(subMaps.map(sm => Object.assign(sm, { type: 'submap' })));
		this.evolved = evolved;
		this.pipelines = pipelines;
	}

	getMapPipelines() {
		// why is this doing this...
		// since pipelines don't have defined visibility, they're
		// getting it from the component itself.
		// this behaviour could be pushed up to when the
		// pipelines are extracted from text.
		if (this.pipelines === undefined) return [];
		let pipeline = this.pipelines
			.map(e => {
				let component = this.mapComponents.find(el => el.name === e.name);
				if (component !== null && component !== undefined) {
					e.visibility = component.visibility;
				} else {
					e.hidden = true;
				}
				return e;
			})
			.filter(e => e.hidden === false)
			.flat();
		return pipeline;
	}

	getEvolvedElements() {
		return this.getEvolveElements().map(el => {
			let v = this.evolved.find(evd => evd.name === el.name);
			return {
				name: el.name,
				id: el.id + 'ev',
				maturity: el.evolveMaturity,
				visibility: el.visibility,
				evolving: false,
				evolved: true,
				label: v.label,
				line: v.line,
				type: el.type,
			};
		});
	}

	getEvolveElements() {
		if (this.evolved === undefined) return [];
		let evolving = this.evolved
			.map(e => {
				return this.mapComponents
					.filter(el => el.name === e.name)
					.map(i => {
						i.evolveMaturity = e.maturity;
						i.evolving = true;
						return i;
					});
			})
			.flat();
		return evolving;
	}

	getNoneEvolvingElements() {
		return this.mapComponents.filter(el => el.evolving === false);
	}

	getNonEvolvedElements() {
		return this.getNoneEvolvingElements().concat(this.getEvolveElements());
	}

	getMergedElements() {
		let evolveElements = this.getEvolveElements();
		let noneEvolving = this.getNoneEvolvingElements();
		let evolvedElements = this.getEvolvedElements();
		let collection = noneEvolving
			.concat(evolvedElements)
			.concat(evolveElements);
		if (this.pipelines === undefined) return collection;
		return collection
			.map(e => {
				let component = this.pipelines.find(el => el.name === e.name);
				e.pipeline =
					component != null && component !== undefined ? true : false;
				return e;
			})
			.flat();
	}
}
