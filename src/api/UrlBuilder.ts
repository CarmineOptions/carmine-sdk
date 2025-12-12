import { getConfig } from "../core/config";

export class UrlBuilder {
  public readonly base: string;
  private _url: URL;

  constructor(path: string) {
    this.base = getConfig().apiUrl;
    this._url = new URL(path, this.base);
  }

  setQuery(key: string, value: string): UrlBuilder {
    this._url.searchParams.set(key, value);
    return this;
  }

  get url(): string {
    return this._url.toString();
  }
}
