const AboutPage = () => {
  return (
    <div className="bg-white min-h-screen py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            About EventFull
          </h1>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
            Connecting people through meaningful experiences.
          </p>
        </div>

        <div className="mt-20">
          <div className="prose prose-indigo prose-lg text-gray-500 mx-auto">
            <p>
              EventFull is a platform designed to bring people together. Whether
              you're organizing a small workshop, a large conference, or a local
              meetup, we provide the tools you need to succeed.
            </p>
            <h3>Our Mission</h3>
            <p>
              Our mission is to democratize event organization. We believe that
              everyone should have the power to bring their community together,
              regardless of their technical skills or budget.
            </p>
            <h3>What We Offer</h3>
            <ul>
              <li>Easy event creation and management</li>
              <li>Secure ticketing and payments</li>
              <li>Real-time analytics</li>
              <li>Community building tools</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
