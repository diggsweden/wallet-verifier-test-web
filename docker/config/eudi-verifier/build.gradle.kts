import org.jetbrains.kotlin.gradle.dsl.KotlinVersion
import org.owasp.dependencycheck.gradle.extension.DependencyCheckExtension
import org.springframework.boot.gradle.plugin.SpringBootPlugin
import org.springframework.boot.gradle.tasks.bundling.BootBuildImage

plugins {
    base
    alias(libs.plugins.spring.boot)
    alias(libs.plugins.kotlin.jvm)
    alias(libs.plugins.kotlin.plugin.spring)
    alias(libs.plugins.kotlin.plugin.serialization)
    alias(libs.plugins.spotless)
    alias(libs.plugins.kover)
    alias(libs.plugins.dependencycheck)
}

repositories {
    val nexusMavenCentral = System.getenv("NEXUS_MAVEN_CENTRAL").takeIf { !it.isNullOrEmpty() } ?: "https://repo.maven.apache.org/maven2"
    val nexusMavenPublic = System.getenv("NEXUS_MAVEN_PUBLIC").takeIf { !it.isNullOrEmpty() } ?: "https://repo.maven.apache.org/maven2"
    val nexusWaltId = System.getenv("NEXUS_WALTID").takeIf { !it.isNullOrEmpty() }

    maven {
        url = uri(nexusMavenCentral)
        isAllowInsecureProtocol = true
    }
    maven {
        url = uri(nexusMavenPublic)
        isAllowInsecureProtocol = true
    }
    if (nexusWaltId != null) {
        maven {
            url = uri(nexusWaltId)
            isAllowInsecureProtocol = true
        }
    } else {
        maven {
            url = uri("https://maven.waltid.dev/releases")
            mavenContent {
                releasesOnly()
            }
        }
    }
    mavenLocal()
}

dependencies {
    implementation(platform(SpringBootPlugin.BOM_COORDINATES))
    implementation(platform("org.jetbrains.kotlinx:kotlinx-serialization-bom:${libs.versions.kotlinxSerialization.get()}"))

    implementation("org.springframework.boot:spring-boot-starter-webflux")
    implementation("org.springframework.boot:spring-boot-starter-actuator")
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
    implementation("io.projectreactor.kotlin:reactor-kotlin-extensions")
    implementation("org.jetbrains.kotlin:kotlin-reflect")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-reactor")
    implementation(libs.presentation.exchange)
    implementation(libs.nimbusds.oauth2.oidc.sdk)
    implementation("org.springframework.boot:spring-boot-starter-security")
    implementation(libs.bouncy.castle)
    implementation(libs.arrow.core)
    implementation(libs.arrow.fx.coroutines)
    implementation("org.springframework.boot:spring-boot-starter-thymeleaf")
    implementation("org.webjars:webjars-locator-core")
    implementation(libs.swagger.ui)
    implementation(libs.waltid.mdoc.credentials)
    implementation("org.jetbrains.kotlinx:kotlinx-datetime:0.6.2")
    implementation("com.augustcellars.cose:cose-java:1.1.0")
    implementation(libs.sd.jwt)
    implementation(libs.ktor.client.apache)
    implementation(libs.jsonpathkt)
    implementation(libs.tink)
    implementation(libs.statium)
    implementation(libs.zxing)
    implementation(libs.uri)
    implementation(libs.dss.service)
    implementation(libs.dss.validation)
    implementation(libs.dss.tsl.validation)
    implementation(libs.dss.utils.apache.commons)
    implementation(libs.json.schema.validator)
    implementation(libs.joni)
    implementation(libs.aedile)

    testImplementation(kotlin("test"))
    testImplementation(libs.kotlinx.coroutines.test)
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("io.projectreactor:reactor-test")
}

java {
    sourceCompatibility = JavaVersion.toVersion(libs.versions.java.get())
}

kotlin {
    jvmToolchain {
        languageVersion = JavaLanguageVersion.of(libs.versions.java.get())
    }

    compilerOptions {
        apiVersion = KotlinVersion.KOTLIN_2_0
        freeCompilerArgs.add("-Xjsr305=strict")
        optIn.addAll(
            "kotlinx.serialization.ExperimentalSerializationApi",
            "kotlin.io.encoding.ExperimentalEncodingApi",
            "kotlin.contracts.ExperimentalContracts",
        )
    }
}

testing {
    suites {
        val test by getting(JvmTestSuite::class) {
            useJUnitJupiter()
        }
    }
}

springBoot {
    buildInfo()
}

tasks.named<BootBuildImage>("bootBuildImage") {
    imageName.set("$group/${project.name}")
    publish.set(false)
    environment.set(System.getenv())
    val env = environment.get()
    docker {
        publishRegistry {
            env["REGISTRY_URL"]?.let { url = it }
            env["REGISTRY_USERNAME"]?.let { username = it }
            env["REGISTRY_PASSWORD"]?.let { password = it }
        }
        env["DOCKER_METADATA_OUTPUT_TAGS"]?.let { tagStr ->
            tags = tagStr.split(delimiters = arrayOf("\n", " ")).onEach { println("Tag: $it") }
        }
    }
}

spotless {
    val ktlintVersion = libs.versions.ktlintVersion.get()
    kotlin {
        ktlint(ktlintVersion)
        // Removed licenseHeaderFile as it may not exist
    }
    kotlinGradle {
        ktlint(ktlintVersion)
    }
}

val nvdApiKey: String? = System.getenv("NVD_API_KEY") ?: properties["nvdApiKey"]?.toString()
val dependencyCheckExtension = extensions.findByType(DependencyCheckExtension::class.java)
dependencyCheckExtension?.apply {
    formats = mutableListOf("XML", "HTML")
    nvd.apiKey = nvdApiKey ?: ""
}
