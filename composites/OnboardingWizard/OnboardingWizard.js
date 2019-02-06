import React from "react";
import PropTypes from "prop-types";
import Step from "./Step";
import StepIndicator from "./StepIndicator";
import LoadingIndicator from "./LoadingIndicator";
import sendStep from "./helpers/ajaxHelper";
import RaisedButton from "material-ui/RaisedButton";
import Header from "./Header";
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import { localize } from "../../utils/i18n";
import muiTheme from "./config/yoast-theme";
import interpolateComponents from "interpolate-components";
import ArrowForwardIcon from "material-ui/svg-icons/navigation/arrow-forward";
import ArrowBackwardIcon from "material-ui/svg-icons/navigation/arrow-back";
import CloseIcon from "material-ui/svg-icons/navigation/close";


/**
 * The OnboardingWizard class.
 */
class OnboardingWizard extends React.Component {
	/**
	 * Initialize the steps and set the current stepId to the first step in the array
	 *
	 * @param {Object} props The values to work with.
	 */
	constructor( props ) {
		super( props );

		this.stepCount = Object.keys( this.props.steps ).length;
		this.clickedButton = {};
		this.state = {
			isLoading: false,
			steps: this.parseSteps( this.props.steps ),
			currentStepId: this.getFirstStep( props.steps ),
			errorMessage: "",
			wizardUrl: props.wizardUrl,
		};

		this.setNextStep = this.setNextStep.bind( this );
		this.setPreviousStep = this.setPreviousStep.bind( this );
	}

	/**
	 * Sets the previous and next stepId for each step.
	 *
	 * @param {Object} steps The object containing the steps.
	 *
	 * @returns {Object} The steps with added previous and next step.
	 */
	parseSteps( steps ) {
		const stepKeyNames = Object.keys( steps );

		// Only add previous and next if there is more than one step.
		if ( stepKeyNames.length < 2 ) {
			return steps;
		}

		const stepKeyNamesLength = stepKeyNames.length;

		// Loop through the steps to set each next and/or previous step.
		for ( let stepIndex = 0; stepIndex < stepKeyNamesLength; stepIndex++ ) {
			const stepKeyName = stepKeyNames[ stepIndex ];

			if ( stepIndex > 0 ) {
				steps[ stepKeyName ].previous = stepKeyNames[ stepIndex - 1 ];
			}

			if ( stepIndex > -1 && stepIndex < stepKeyNamesLength - 1 ) {
				steps[ stepKeyName ].next = stepKeyNames[ stepIndex + 1 ];
			}

			steps[ stepKeyName ].fields = this.getFields( steps[ stepKeyName ].fields );
		}

		return steps;
	}

	/**
	 * Gets fields from the properties.
	 *
	 * @param {Array} fieldsToGet The array with the fields to get from the properties.
	 *
	 * @returns {Object} The fields from the properties, based on the array passed in the arguments.
	 */
	getFields( fieldsToGet = [] ) {
		const fields = {};

		fieldsToGet.forEach(
			( fieldName ) => {
				if ( this.props.fields[ fieldName ] ) {
					fields[ fieldName ] = this.props.fields[ fieldName ];
				}
			}
		);

		return fields;
	}

	/**
	 * Sends the options for the current step via POST request to the back-end
	 * and sets the state to the target step when successful.
	 *
	 * @param {step} step The step to render after the current state is stored.
	 * @param {SyntheticEvent} evt The click even that triggered this post step.
	 *
	 * @returns {void}
	 */
	postStep( step, evt ) {
		if ( ! step ) {
			return;
		}

		this.setState( { isLoading: true, errorMessage: "" } );
		this.clickedButton = evt.currentTarget;

		sendStep(
			this.props.endpoint.url,
			{
				data: this.step.state.fieldValues[ this.state.currentStepId ],
				headers: this.props.endpoint.headers,
			} )
			.then( this.handleSuccessful.bind( this, step ) )
			.catch( this.handleFailure.bind( this ) );
	}

	/**
	 * Gets the first step from the step object.
	 *
	 * @param {Object} steps The object containing the steps.
	 *
	 * @returns {Object}  The first step object
	 */
	getFirstStep( steps ) {
		const firstStep = this.props.startingStep;
		if ( firstStep !== "" ) {
			return firstStep;
		}
		// When no startingStep is set, use the first step of the wizard as default.
		return Object.getOwnPropertyNames( steps )[ 0 ];
	}

	/**
	 * When the request is handled successfully.
	 *
	 * @param {string} step The next step to render.
	 *
	 * @returns {void}
	 */
	handleSuccessful( step ) {
		this.setState( {
			isLoading: false,
			currentStepId: step,
		} );

		// Set focus on the main content but not when clicking the step buttons.
		if ( -1 === this.clickedButton.className.indexOf( "step" ) ) {
			this.step.stepContainer.focus();
		}
	}

	/**
	 * When the request is handled incorrect.
	 *
	 * @returns {void}
	 */
	handleFailure() {
		this.setState( {
			isLoading: false,
			errorMessage: interpolateComponents( {
				/** Translators: {{link}} resolves to the link opening tag to yoa.st/bugreport, {{/link}} resolves to the link closing tag. **/
				mixedString: this.props.translate(
					"A problem occurred when saving the current step, {{link}}please file a bug report{{/link}} " +
					"describing what step you are on and which changes you want to make (if any)."
				),
				// The anchor does have content (see mixedString above).
				// eslint-disable-next-line jsx-a11y/anchor-has-content
				components: { link: <a href="https://yoa.st/bugreport" target="_blank" rel="noopener noreferrer" /> },
			} ),
		} );
	}

	/**
	 * Updates the state to the next stepId in the wizard.
	 *
	 * @param {SyntheticEvent} evt The click event that triggered the next step call.
	 * @returns {void}
	 */
	setNextStep( evt ) {
		const currentStep = this.getCurrentStep();

		this.postStep( currentStep.next, evt );
	}

	/**
	 * Updates the state to the previous stepId in the wizard.
	 *
	 * @param {SyntheticEvent} evt The click event that triggered the next step call.
	 * @returns {void}
	 */
	setPreviousStep( evt ) {
		const currentStep = this.getCurrentStep();

		this.postStep( currentStep.previous, evt );
	}

	/**
	 * Gets the current step from the steps.
	 *
	 * @returns {Object} The current step.
	 */
	getCurrentStep() {
		return this.state.steps[ this.state.currentStepId ];
	}

	/**
	 * Gets the index number for a step from the array with step objects.
	 *
	 * @returns {int} The step number when found, or 0 when the step is not found.
	 */
	getCurrentStepNumber() {
		const currentStep = this.state.currentStepId;
		const steps = Object.keys( this.state.steps );

		const stepNumber = steps.indexOf( currentStep );

		if ( stepNumber > -1 ) {
			return stepNumber + 1;
		}

		return 0;
	}

	/**
	 * Creates a next or previous button to navigate through the steps.
	 *
	 * @param {string} type A next or previous button.
	 * @param {Object} attributes The attributes for the button component.
	 * @param {string} currentStep The current step object in the wizard.
	 * @param {string} className The class name for the button.
	 *
	 * @returns {ReactElement} Returns a RaisedButton component depending on an existing previous/next step.
	 */
	getNavigationbutton( type, attributes, currentStep, className ) {
		let hideButton = false;

		if ( type === "next" && ! currentStep.next ) {
			attributes.label = this.props.translate( "Close" );
			attributes[ "aria-label" ] = this.props.translate( "Close the Wizard" );
			attributes.icon = <CloseIcon viewBox="0 0 28 28" />;
			attributes.onClick = () => {
				if ( this.props.finishUrl !== "" ) {
					window.location.href = this.props.finishUrl;

					return;
				}

				history.go( -1 );
			};
		}
		if ( type === "previous" && ! currentStep.previous ) {
			hideButton = true;
		}

		return ( hideButton ) ? "" : <RaisedButton className={ className } { ...attributes } />;
	}

	/**
	 * Appends the name of the step that is navigated to as a fragment to the end of the URL.
	 *
	 * As a result, the URL changes for every step, and the user can use their browser's back and
	 * next to navigate between steps.
	 *
	 * @param {string} stepName The name of the step that has been navigated to.
	 *
	 * @returns {void}
	 */
	changeBrowserHistory( stepName ) {
		window.history.pushState( null, null, this.state.wizardUrl + "#" + stepName );
	}

	/**
	 * Handles the onClick event.
	 *
	 * Posts the step to the endpoint and appends the step name as a hash to the URL.
	 *
	 * @param {string} stepName The name of the step that is clicked on.
	 * @param {event} evt The onClick event.
	 *
	 * @returns {void}
	 */
	handleOnClick( stepName, evt ) {
		this.postStep( stepName, evt );
		this.changeBrowserHistory( stepName );
	}

	/**
	 * Renders the wizard.
	 *
	 * @returns {JSX.Element} The rendered step in the wizard.
	 */
	render() {
		const step = this.getCurrentStep();

		let navigation = "";
		if ( ! step.hideNavigation ) {
			const previousButton = this.getNavigationbutton( "previous", {
				label: this.props.translate( "Previous" ),
				"aria-label": this.props.translate( "Previous step" ),
				onClick: this.setPreviousStep,
				disableFocusRipple: true,
				disableTouchRipple: true,
				icon: <ArrowBackwardIcon viewBox="0 0 28 28" />,
			}, step, "yoast-wizard--button yoast-wizard--button__previous" );

			const nextButton = this.getNavigationbutton( "next", {
				label: this.props.translate( "Next" ),
				"aria-label": this.props.translate( "Next step" ),
				primary: true,
				onClick: this.setNextStep,
				disableFocusRipple: true,
				disableTouchRipple: true,
				labelPosition: "before",
				icon: <ArrowForwardIcon viewBox="0 0 28 28" />,
			}, step, "yoast-wizard--button yoast-wizard--button__next" );

			navigation = <div className="yoast-wizard--navigation">{ previousButton }{ nextButton }</div>;
		}

		/* Translators: %s expands to "Yoast SEO for WordPress". */
		let headerTitle = this.props.translate( "%s installation wizard" );
		headerTitle = headerTitle.replace( "%s", "Yoast SEO for WordPress" );

		return (
			<MuiThemeProvider muiTheme={ muiTheme }>
				<div className="yoast-wizard-body">
					<Header headerTitle={ headerTitle } icon={ this.props.headerIcon } />
					<StepIndicator
						steps={ this.props.steps } stepIndex={ this.getCurrentStepNumber() - 1 }
						onClick={ ( stepName, evt ) => this.handleOnClick( stepName, evt ) }
					/>
					<main className="yoast-wizard-container">
						<div className="yoast-wizard">
							{ this.renderErrorMessage() }
							<Step
								ref={ ref => {
									this.step = ref;
								} }
								currentStep={ this.state.currentStepId }
								title={ step.title }
								fields={ step.fields }
								customComponents={ this.props.customComponents }
								nextStep={ this.setNextStep }
								previousStep={ this.setPreviousStep }
								fullWidth={ step.fullWidth }
							/>
							{ navigation }
						</div>
						{ ( this.state.isLoading ) ? <div className="yoast-wizard-overlay"><LoadingIndicator /></div> : "" }
					</main>
				</div>
			</MuiThemeProvider>
		);
	}

	/**
	 * Renders the error message
	 *
	 * @returns {JSX.Element|string} The rendered output.
	 */
	renderErrorMessage() {
		if ( this.state.errorMessage === "" ) {
			return "";
		}

		return <div className="yoast-wizard-notice yoast-wizard-notice__error">{ this.state.errorMessage }</div>;
	}
}

OnboardingWizard.propTypes = {
	endpoint: PropTypes.object.isRequired,
	steps: PropTypes.object.isRequired,
	fields: PropTypes.object.isRequired,
	customComponents: PropTypes.object,
	finishUrl: PropTypes.string,
	translate: PropTypes.any,
	headerIcon: PropTypes.func,
};

OnboardingWizard.defaultProps = {
	customComponents: {},
	finishUrl: "",
};

export default localize( OnboardingWizard );
