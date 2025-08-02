export abstract class ApiClientBase {

  protected async getHeaders() {
    return {
      Authorization: `Bearer ${await this.getIdToken()}`,
    };
  }

  protected async fetchAuthSession() {
    return {
      tokens: {
        idToken: "123",
      },
    };
  }

  protected async getIdToken() {
    const session = await this.fetchAuthSession();
    return session.tokens?.idToken?.toString();
  }
}
