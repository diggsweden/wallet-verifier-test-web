rootProject.name = "eudi-srv-web-verifier-endpoint-23220-4-kt"

pluginManagement {
    repositories {
        val nexusGradlePlugins = System.getenv("NEXUS_GRADLE_PLUGINS")
        val nexusMavenCentral = System.getenv("NEXUS_MAVEN_CENTRAL")
        
        if (!nexusGradlePlugins.isNullOrEmpty()) {
            maven {
                url = uri(nexusGradlePlugins)
                isAllowInsecureProtocol = true
            }
        }
        if (!nexusMavenCentral.isNullOrEmpty()) {
            maven {
                url = uri(nexusMavenCentral)
                isAllowInsecureProtocol = true
            }
        }
        // Fallback to public repositories if Nexus is not configured
        gradlePluginPortal()
        mavenCentral()
    }
}