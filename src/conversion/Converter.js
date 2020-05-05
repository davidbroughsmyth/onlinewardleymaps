import TitleExtractionStrategy from './TitleExtractionStrategy';
import MethodExtractionStrategy from './MethodExtractionStrategy';
import XAxisLabelsExtractionStrategy from './XAxisLabelsExtractionStrategy';
import PresentationExtractionStrategy from './PresentationExtractionStrategy';
import ExtractLocation from './ExtractLocation';
import NoteExtractionStrategy from './NoteExtractionStrategy';
import AnnotationExtractionStrategy from './AnnotationExtractionStrategy';
import ComponentExtractionStrategy from './ComponentExtractionStrategy';

export default class Converter {
	parse(data) {
		let t = this.stripComments(data);
		let strategies = [
			new TitleExtractionStrategy(t),
			new MethodExtractionStrategy(t),
			new XAxisLabelsExtractionStrategy(t),
			new PresentationExtractionStrategy(t),
			new NoteExtractionStrategy(t),
			new AnnotationExtractionStrategy(t),
			new ComponentExtractionStrategy(t),
		];

		let jobj = {
			anchors: this.anchors(t),
			links: this.links(t),
			evolved: this.evolved(t),
			pipelines: this.pipelines(t),
		};

		strategies.forEach(s => {
			jobj = Object.assign(jobj, s.apply());
		});

		return jobj;
	}

	extractLocation(input, defaultValue) {
		return new ExtractLocation().extract(input, defaultValue);
	}

	stripComments(data) {
		var doubleSlashRemoved = data.split('\n').map(line => {
			return line.split('//')[0];
		});

		let lines = doubleSlashRemoved;
		let linesToKeep = [];
		let open = false;

		for (let i = 0; i < lines.length; i++) {
			let currentLine = lines[i];
			if (currentLine.indexOf('/*') > -1) {
				open = true;
				linesToKeep.push(currentLine.split('/*')[0].trim());
			} else if (open) {
				if (currentLine.indexOf('*/') > -1) {
					open = false;
					linesToKeep.push(currentLine.split('*/')[1].trim());
				}
			} else if (open == false) {
				linesToKeep.push(currentLine);
			}
		}

		return linesToKeep.join('\n');
	}

	pipelines(input) {
		let trimmed = input.trim();
		let elementsAsArray = trimmed.split('\n');
		let elementsToReturn = [];
		for (let i = 0; i < elementsAsArray.length; i++) {
			try {
				const element = elementsAsArray[i];
				if (element.trim().indexOf('pipeline ') == 0) {
					let name = element.split('pipeline ')[1].trim();

					if (name.indexOf('[') > -1) {
						name = name.split('[')[0].trim();
					}

					let pipelineHidden = true;
					let pieplinePos = { maturity1: 0.2, maturity2: 0.8 };
					let findPos = element.split('[');
					if (
						element.indexOf('[') > -1 &&
						element.indexOf(']') > -1 &&
						findPos.length > 1 &&
						findPos[1].indexOf(']') > -1
					) {
						let extractedPos = findPos[1].split(']')[0].split(',');
						pieplinePos.maturity1 = parseFloat(extractedPos[0].trim());
						pieplinePos.maturity2 = parseFloat(extractedPos[1].trim());
						pipelineHidden = false;
					}

					elementsToReturn.push({
						name: name,
						maturity1: pieplinePos.maturity1,
						maturity2: pieplinePos.maturity2,
						hidden: pipelineHidden,
						line: 1 + i,
					});
				}
			} catch (err) {
				throw { line: i, err };
			}
		}

		return elementsToReturn;
	}

	evolved(input) {
		let trimmed = input.trim();
		let elementsAsArray = trimmed.split('\n');
		let elementsToReturn = [];
		for (let i = 0; i < elementsAsArray.length; i++) {
			try {
				const element = elementsAsArray[i];
				if (element.trim().indexOf('evolve ') == 0) {
					let name = element.split('evolve ')[1].trim();

					let evolveMaturity = element.match(/\s[0-9]?\.[0-9]+[0-9]?/);
					let newPoint = 0.85;
					if (evolveMaturity.length > 0) {
						newPoint = parseFloat(evolveMaturity[0]);
						name = name.split(newPoint)[0].trim();
					}

					let labelOffset = { x: 5, y: -10 };

					if (element.indexOf('label ') > -1) {
						let findPos = element.split('label [');
						if (findPos.length > 0 && findPos[1].indexOf(']') > -1) {
							let extractedPos = findPos[1].split(']')[0].split(',');
							labelOffset.x = parseFloat(extractedPos[0].trim());
							labelOffset.y = parseFloat(extractedPos[1].trim());
						}
					}

					elementsToReturn.push({
						name: name,
						maturity: newPoint,
						label: labelOffset,
						line: 1 + i,
					});
				}
			} catch (err) {
				throw { line: i, err };
			}
		}

		return elementsToReturn;
	}

	anchors(input) {
		let trimmed = input.trim();
		let elementsAsArray = trimmed.split('\n');

		let anchorsToReturn = [];

		for (let i = 0; i < elementsAsArray.length; i++) {
			try {
				const element = elementsAsArray[i];
				if (element.trim().indexOf('anchor') == 0) {
					let name = element
						.split('anchor ')[1]
						.trim()
						.split(' [')[0]
						.trim();

					let positionData = this.extractLocation(element, {
						visibility: 0.95,
						maturity: 0.05,
					});

					anchorsToReturn.push({
						name: name,
						maturity: positionData.maturity,
						visibility: positionData.visibility,
						id: 1 + i,
						line: 1 + i,
					});
				}
			} catch (err) {
				throw { line: i, err };
			}
		}

		return anchorsToReturn;
	}

	links(input) {
		let trimmed = input.trim();
		let elementsAsArray = trimmed.split('\n');

		let linksToReturn = [];

		for (let i = 0; i < elementsAsArray.length; i++) {
			try {
				const element = elementsAsArray[i];
				if (
					element.trim().length > 0 &&
					element.trim().indexOf('evolution') == -1 &&
					element.trim().indexOf('anchor') == -1 &&
					element.trim().indexOf('evolve') == -1 &&
					element.trim().indexOf('component') == -1 &&
					element.trim().indexOf('style') == -1 &&
					element.trim().indexOf('build') == -1 &&
					element.trim().indexOf('buy') == -1 &&
					element.trim().indexOf('outsource') == -1 &&
					element.trim().indexOf('title') == -1 &&
					element.trim().indexOf('annotation') == -1 &&
					element.trim().indexOf('annotations') == -1 &&
					element.trim().indexOf('y-axis') == -1 &&
					element.trim().indexOf('pipeline') == -1 &&
					element.trim().indexOf('note') == -1
				) {
					if (element.indexOf('+>') > -1) {
						let name = element.split('+>');
						linksToReturn.push({
							start: name[0].trim(),
							end: name[1].trim(),
							flow: true,
							future: true,
							past: false,
						});
					} else if (element.indexOf('+<>') > -1) {
						let name = element.split('+<>');
						linksToReturn.push({
							start: name[0].trim(),
							end: name[1].trim(),
							flow: true,
							future: true,
							past: true,
						});
					} else if (element.indexOf('+<') > -1) {
						let name = element.split('+<');
						linksToReturn.push({
							start: name[0].trim(),
							end: name[1].trim(),
							flow: true,
							future: false,
							past: true,
						});
					} else if (element.indexOf("+'") > -1) {
						let flowValue;
						let endName;
						let isFuture = false;
						let isPast = false;
						if (element.indexOf("'>") > -1) {
							flowValue = element.split("+'")[1].split("'>")[0];
							endName = element.split("'>");
							isFuture = true;
						} else if (element.indexOf("'<>") > -1) {
							flowValue = element.split("+'")[1].split("'<>")[0];
							endName = element.split("'<>");
							isPast = true;
							isFuture = true;
						} else if (element.indexOf("'<") > -1) {
							flowValue = element.split("+'")[1].split("'<")[0];
							endName = element.split("'<");
							isPast = true;
						}

						let startName = element.split("+'");
						linksToReturn.push({
							start: startName[0].trim(),
							end: endName[1].trim(),
							flow: true,
							flowValue: flowValue,
							future: isFuture,
							past: isPast,
						});
					} else {
						let name = element.split('->');
						linksToReturn.push({
							start: name[0].trim(),
							end: name[1].trim(),
							flow: false,
						});
					}
				}
			} catch (err) {
				throw { line: i, err };
			}
		}

		return linksToReturn;
	}
}