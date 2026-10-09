/**
 * Reusable REST operations for one resource. It transports API resources only;
 * bounded-context assemblers translate between resources and the domain model.
 */
export class BaseEndpoint {
    /**
     * @param {import('./base-api.js').BaseApi} baseApi
     * @param {string} endpointPath path relative to the API base URL.
     */
    constructor(baseApi, endpointPath) {
        this.http = baseApi.http;
        this.endpointPath = endpointPath;
    }

    getAll() {
        return this.http.get(this.endpointPath);
    }

    getById(id) {
        return this.http.get(`${this.endpointPath}/${id}`);
    }

    create(resource) {
        return this.http.post(this.endpointPath, resource);
    }

    update(id, resource) {
        return this.http.put(`${this.endpointPath}/${id}`, resource);
    }

    delete(id) {
        return this.http.delete(`${this.endpointPath}/${id}`);
    }
}
