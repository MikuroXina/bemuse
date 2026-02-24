const no = () => Promise.reject(new Error('Online services not enabled.'))

export class OfflineService {
  getCurrentUser() {
    return null
  }

  isLoggedIn() {
    return false
  }

  signUp() {
    return no()
  }

  logIn() {
    return no()
  }

  logOut() {
    return no()
  }

  changePassword() {
    return no()
  }

  submitScore() {
    return Promise.reject(new Error('Online services not enabled.'))
  }

  // Retrieves a record.
  //
  // Returns a record object.
  retrieveRecord() {
    return Promise.reject(new Error('Online services not enabled.'))
  }

  // Retrieves the scoreboard
  retrieveScoreboard() {
    return Promise.reject(new Error('Online services not enabled.'))
  }

  // Retrieve multiple records!
  retrieveMultipleRecords() {
    return Promise.reject(new Error('Online services not enabled.'))
  }
}

export default OfflineService
