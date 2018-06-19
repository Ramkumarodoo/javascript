import "whatwg-fetch";
import { prepareInternalRequest, doRequest } from "../functions/api";
import {
	getLogoutUrl,
	getAuthUrl,
	removeCookies as removeAuthCookies,
	getUserId,
	hasCookieParams,
} from "../functions/auth";

/*
 * Action types
 */
export const LOGIN = "LOGIN";
export const LOGOUT = "LOGOUT";

export const FETCH_USER_REQUEST = "FETCH_USER_REQUEST";
export const FETCH_USER_FAILURE = "FETCH_USER_FAILURE";
export const FETCH_USER_SUCCESS = "FETCH_USER_SUCCESS";

export const RESET_SAVE_MESSAGE = "RESET_SAVE_MESSAGE";

export const PASSWORD_UPDATE_REQUEST = "PASSWORD_UPDATE_REQUEST";
export const PASSWORD_UPDATE_FAILURE = "PASSWORD_UPDATE_FAILURE";
export const PASSWORD_UPDATE_SUCCESS = "PASSWORD_UPDATE_SUCCESS";

export const PROFILE_UPDATE_REQUEST = "PROFILE_UPDATE_REQUEST";
export const PROFILE_UPDATE_FAILURE = "PROFILE_UPDATE_FAILURE";
export const PROFILE_UPDATE_SUCCESS = "PROFILE_UPDATE_SUCCESS";

export const DISABLE_USER_START = "DISABLE_USER_START";
export const DISABLE_USER_FAILURE = "DISABLE_USER_FAILURE";
export const DISABLE_USER_SUCCESS = "DISABLE_USER_SUCCESS";

/**
 * Action creators
 */

/**
 * An action creator for the login action.
 *
 * @param {string} accessToken A valid access token for the user.
 * @param {string} userId The user ID that wants to log in.
 * @returns {Object} A login action.
 */
export function login( accessToken, userId ) {
	return {
		type: LOGIN,
		data: {
			accessToken,
			userId,
		},
	};
}

/**
 * An action creator for the logout action.
 *
 * @returns {Object} A logout action.
 */
export function logout() {
	removeAuthCookies();
	document.location.href = getLogoutUrl();

	return {
		type: LOGOUT,
	};
}

/**
 * An action creator for the request user action.
 *
 * @returns {Object} A request user action.
 */
export function requestUser() {
	return {
		type: FETCH_USER_REQUEST,
	};
}

/**
 * An action creator for the receive user action.
 *
 * @param {Object} user The user data that was successfully received.
 * @returns {Object} A receive user action.
 */
export function receiveUser( user ) {
	return {
		type: FETCH_USER_SUCCESS,
		user: user,
	};
}

/**
 * Forces a redirect to the login page.
 *
 * @returns {void}
 */
export function redirectToLogin() {
	document.location.href = getAuthUrl();
}

/**
 * An action creator for the fetch user action.
 *
 * @param {string} userId The user ID for the user that we want to fetch.
 *
 * @returns {Object} A fetch user action.
 */
export function fetchUser( userId ) {
	return ( dispatch ) => {
		dispatch( requestUser() );

		// If our credentials came from the parameters then bypass the profile request.
		if ( hasCookieParams() ) {
			let request = prepareInternalRequest( `Customers/${userId}/` );

			return doRequest( request )
				.then( json =>
					dispatch( receiveUser( {
						profile: {
							email: `Impersonating: ${json.email}`,
							enabled: true,
						},
					} ) ) ).catch( redirectToLogin );
		}

		let request = prepareInternalRequest( `Customers/${userId}/profile/` );

		return doRequest( request )
			.then( json => dispatch( receiveUser( json ) ) )
			.catch( redirectToLogin );
	};
}

/**
 * An action creator for the request user action.
 *
 * @returns {Object} A request user action.
 */
export function disableUserStart() {
	return {
		type: DISABLE_USER_START,
	};
}

/**
 * An action creator for the receive user action.
 *
 * @returns {Object} A receive user action.
 */
export function disableUserSuccess() {
	return {
		type: DISABLE_USER_SUCCESS,
	};
}

/**
 * An action creator for the receive user action.
 *
 * @param {Object} error The error that was thrown.
 * @returns {Object} A disable user failure action.
 */
export function disableUserFailure( error ) {
	return {
		type: DISABLE_USER_FAILURE,
		error: error,
	};
}

/**
 * An action creator for the fetch user action.
 *
 * @returns {Object} A fetch user action.
 */
export function disableUser() {
	let userId = getUserId();

	return ( dispatch ) => {
		dispatch( disableUserStart() );

		let request = prepareInternalRequest( `Customers/${userId}/`, "PATCH", { enabled: false } );

		return doRequest( request )
			.then( json => dispatch( disableUserSuccess() ) )
			.catch( error => dispatch( disableUserFailure( error ) ) );
	};
}

/**
 * An action creator for the password update request action.
 *
 * @returns {Object} The password update request action.
 */
export function passwordUpdateRequest() {
	return {
		type: PASSWORD_UPDATE_REQUEST,
	};
}

/**
 * An action creator for the password update failure action.
 *
 * @param {Object} error The error that occurred.
 * @returns {Object} The password update failure action.
 */
export function passwordUpdateFailure( error ) {
	return {
		type: PASSWORD_UPDATE_FAILURE,
		error: error,
	};
}

/**
 * An action creator for the profile update success action.
 *
 * @param {Object} newPassword The password after a successful password update.
 * @returns {Object} The password update success action.
 */
export function passwordUpdateSuccess( newPassword ) {
	return {
		type: PASSWORD_UPDATE_SUCCESS,
		password: newPassword,
	};
}

/**
 * An action creator for the profile update request action.
 *
 * @returns {Object} The profile update request action.
 */
export function profileUpdateRequest() {
	return {
		type: PROFILE_UPDATE_REQUEST,
	};
}

/**
 * An action creator for the profile update failure action.
 *
 * @param {Object} error The error that occurred.
 * @returns {Object} The profile update failure action.
 */
export function profileUpdateFailure( error ) {
	return {
		type: PROFILE_UPDATE_FAILURE,
		error: error,
	};
}

/**
 * An action creator for the profile update success action.
 *
 * @param {Object} newProfile The profile after a successful profile update.
 * @returns {Object} The profile update success action.
 */
export function profileUpdateSuccess( newProfile ) {
	return {
		type: PROFILE_UPDATE_SUCCESS,
		profile: newProfile,
	};
}

/**
 * An action creator for the reset save message action.
 *
 * @returns {Object} The reset save message action.
 */
export function resetSaveMessage() {
	return {
		type: RESET_SAVE_MESSAGE,
	};
}

/**
 * An action creator to update the profile of the user.
 *
 * @param {Object} profile The profile object.
 * @param {string} profile.email The email to set on the profile.
 * @returns {Function} A function that
 */
export function updateProfile( profile ) {
	return ( dispatch ) => {
		dispatch( profileUpdateRequest() );

		let userId = getUserId();
		let request = prepareInternalRequest( `Customers/${userId}/profile/`, "PATCH", profile );

		return doRequest( request )
			.then( ( response ) => {
				dispatch( profileUpdateSuccess( response ) );
			} )
			.catch( ( error ) => dispatch( profileUpdateFailure( error ) ) );
	};
}

/**
 * An action creator to update the profile of the user.
 *
 * @param {Object} passwords Object containing your old password, new password and password confirmation.
 * @returns {Function} A function that
 */
export function updatePassword( passwords ) {
	return ( dispatch ) => {
		dispatch( passwordUpdateRequest() );

		let userId  = getUserId();
		let request = prepareInternalRequest( `Customers/${userId}/profile/`, "PATCH", passwords );

		return doRequest( request )
			.then( ( response ) => {
				dispatch( passwordUpdateSuccess( response ) );
			} )
			.catch( ( error ) => dispatch( passwordUpdateFailure( error ) ) );
	};
}


/**
 * Uploads an avatar image for the current user.
 * @param {File} image the image to upload
 * @returns {Function} Function to call when this action is dispatched.
 */
export function uploadAvatar( image ) {
	return ( dispatch ) => {
		// Upload to internal REST endpoint here!
	};
}
