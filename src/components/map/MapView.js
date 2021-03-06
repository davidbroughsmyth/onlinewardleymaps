import React, { Component } from 'react';
import MapCanvas from './MapCanvas';

class MapView extends Component {
	render() {
		return (
			<>
				{/* Wrapping div required to ensure that images aren't generated with a ton of whitespace */}
				<div ref={this.props.mapRef}>
					<h5 id="title">{this.props.mapTitle}</h5>
					<div id="map">
						<MapCanvas
							mapDimensions={this.props.mapDimensions}
							mapPadding={20}
							mapStyleDefs={this.props.mapStyleDefs}
							mapYAxis={this.props.mapYAxis}
							mapEvolutionStates={this.props.mapEvolutionStates}
							mapStyle={this.props.mapStyle}
							mapObject={this.props.mapObject}
							mapComponents={this.props.mapComponents}
							mapSubMaps={this.props.mapSubMaps}
							mapEvolved={this.props.mapEvolved}
							mapPipelines={this.props.mapPipelines}
							mapAnchors={this.props.mapAnchors}
							mapLinks={this.props.mapLinks}
							launchUrl={this.props.launchUrl}
							mapAnnotations={this.props.mapAnnotations}
							mapNotes={this.props.mapNotes}
							mapAnnotationsPresentation={this.props.mapAnnotationsPresentation}
							mapMethods={this.props.mapMethods}
							mapText={this.props.mapText}
							mutateMapText={this.props.mutateMapText}
							setMetaText={this.props.setMetaText}
							metaText={this.props.metaText}
							evolutionOffsets={this.props.evolutionOffsets}
							setHighlightLine={this.props.setHighlightLine}
						/>
					</div>
				</div>
			</>
		);
	}
}

export default MapView;
