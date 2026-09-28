import Foundation

/// Creates and calibrates sessions against backend-api.
final class SessionsClient {
    private let session: URLSession

    init(session: URLSession = .shared) {
        self.session = session
    }

    struct CreateSessionInput: Encodable {
        let subjectPseudoId: String
        let protocolId: String
        let protocolVersion: String
        let deploymentContext: String // "clinic_supervised" | "home_rehab"
        let consentRecordId: String
        let retentionPolicy: RetentionPolicy

        struct RetentionPolicy: Encodable {
            let rawVideo: RawVideo
            let derivedEvents: DerivedEvents
            struct RawVideo: Encodable { let optIn: Bool; let retentionDays: Int? }
            struct DerivedEvents: Encodable { let retentionDays: Int }
        }
    }

    struct SessionRecord: Decodable {
        let id: String
        let state: SafetyState
    }

    func create(_ input: CreateSessionInput) async throws -> SessionRecord {
        var request = URLRequest(url: BackendConfig.baseURL.appendingPathComponent("sessions"))
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "content-type")
        request.httpBody = try JSONEncoder().encode(input)

        let (data, _) = try await session.data(for: request)
        return try JSONDecoder().decode(SessionRecord.self, from: data)
    }

    /// Setup -> Observing, once the calibration flow confirms the camera view
    /// and consent are in place (services/backend-api/src/sessions/sessions.controller.ts).
    func calibrate(sessionId: String) async throws -> SafetyState {
        var request = URLRequest(url: BackendConfig.baseURL.appendingPathComponent("sessions/\(sessionId)/calibrate"))
        request.httpMethod = "POST"
        let (data, _) = try await session.data(for: request)
        struct Result: Decodable { let state: SafetyState }
        return try JSONDecoder().decode(Result.self, from: data).state
    }
}
